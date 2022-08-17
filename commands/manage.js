const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const {
    getGameChannels,
    findGameChannels,
    getJoinedGameChannels,
} = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("관리")
        .setDescription("참가할 채널을 관리합니다.")
        .addIntegerOption((option) =>
            option
                .setName("페이지")
                .setDescription("페이지 번호를 입력해주세요.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(Math.floor(getGameChannels().length / 25) + 1)
        ),
    async execute(interaction) {
        /*// ::brief design::
        0. Due to the technical limitation, get the page number from options
            and manage only for that page (up to 25 channels)
        1. core logic for the command is similar to the old one;
            just care about the range of channels to manage
        */
        const gameChannels = getGameChannels();
        const pageNumber = interaction.options.getInteger("페이지");

        const numChannels =
            pageNumber === Math.floor(getGameChannels().length / 25) + 1
                ? gameChannels.length % 25
                : 25;
        const pageChannels = gameChannels.slice(
            (pageNumber - 1) * 25,
            (pageNumber - 1) * 25 + numChannels
        );

        const selectButtons = [
            {
                customId: "yes",
                label: "있음",
                style: ButtonStyle.Success,
                action: async function (interaction) {
                    const selectMenu = new SelectMenuBuilder()
                        .setCustomId("manageSelect")
                        .setMaxValues(numChannels);

                    for (const gameChannel of pageChannels) {
                        selectMenu.addOptions({
                            label: gameChannel.channel.name,
                            value: gameChannel.channel.name,
                            default: interaction.member.roles.cache.some(
                                (role) => role === gameChannel.role
                            ),
                        });
                    }

                    const selectRow = new ActionRowBuilder().addComponents(
                        selectMenu
                    );

                    await interaction.reply({
                        content: "참가할 채널만 모두 선택해주세요.",
                        components: [selectRow],
                    });

                    const selectFilter = (interaction) => {
                        return selectRow.customId === interaction.customId;
                    };

                    const selectCollector =
                        interaction.channel.createMessageComponentCollector({
                            filter: selectFilter,
                            time: 60 * 1000,
                        });

                    selectCollector.on("collect", async (interaction) => {
                        const beforeGameChannels = getJoinedGameChannels(
                            interaction.member
                        );
                        let afterGameChannels = [];
                        interaction.values.map((value) =>
                            afterGameChannels.push(findGameChannels(value))
                        );
                        let joinGameChannels = [];
                        let leaveGameChannels = [];

                        for (const gameChannel of afterGameChannels) {
                            if (!beforeGameChannels.includes(gameChannel)) {
                                joinGameChannels.push(gameChannel);
                            }
                        }
                        for (const gameChannel of beforeGameChannels) {
                            if (!afterGameChannels.includes(gameChannel)) {
                                leaveGameChannels.push(gameChannel);
                            }
                        }

                        for (const gameChannel of joinGameChannels) {
                            interaction.member.roles.add(gameChannel.role);
                        }
                        for (const gameChannel of leaveGameChannels) {
                            interaction.member.roles.remove(gameChannel.role);
                        }
                        await interaction.reply(
                            "성공적으로 참가할 채널을 수정했습니다."
                        );
                    });

                    selectCollector.on("end", async (collect) => {
                        console.log("timeout!");
                    });
                },
            },
            {
                customId: "no",
                label: "없음",
                style: ButtonStyle.Danger,
                action: async function (interaction) {
                    for (const gameChannel of pageChannels) {
                        interaction.member.roles.remove(gameChannel.role);
                    }

                    await interaction.reply(
                        "목록 내 채널에서 전부 나오셨습니다."
                    );
                },
            },
        ];

        const buttonRow = new ActionRowBuilder().addComponents(
            selectButtons.map((button) => {
                return new ButtonBuilder()
                    .setCustomId(button.customId)
                    .setLabel(button.label)
                    .setStyle(button.style);
            })
        );

        await interaction.reply({
            content: `아래 채널들 중 참가할 채널이 있으신가요?\n채널 목록: ${pageChannels
                .map((gameChannel) => gameChannel.channel.name)
                .join(", ")}`,
            components: [buttonRow],
        });

        const buttonFilter = (interaction) => {
            return selectButtons.filter(
                (button) => button.customId === interaction.customId
            );
        };

        const buttonCollector =
            interaction.channel.createMessageComponentCollector({
                filter: buttonFilter,
                time: 60 * 1000,
            });

        buttonCollector.on("collect", async (interaction) => {
            const button = selectButtons.find(
                (button) => button.customId === interaction.customId
            );
            await button.action(interaction);
        });

        buttonCollector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
