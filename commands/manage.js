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
        .setDescription("참가할 채널을 관리합니다."),
    async execute(interaction) {
        const gameChannels = getGameChannels();

        const select_menu = new SelectMenuBuilder()
            .setCustomId("join_select")
            .setMaxValues(gameChannels.length);

        for (const gameChannel of gameChannels) {
            select_menu.addOptions({
                label: gameChannel.channel.name,
                value: gameChannel.channel.name,
                default: interaction.member.roles.cache.some(
                    (role) => role === gameChannel.role
                ),
            });
        }

        const selectButtons = [
            {
                customId: "yes",
                label: "있음",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    // open select menu as normal
                },
            },
            {
                customId: "no",
                label: "없음",
                style: ButtonStyle.Danger,
                action: async (interaction) => {
                    // delete all roles in gameChannel for interaction.member
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
            content: `채널 목록 내에서 참가할 채널이 있으신가요?`,
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

        const selectRow = new ActionRowBuilder().addComponents(select_menu);

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
            await interaction.reply("성공적으로 참가할 채널을 수정했습니다.");
        });

        selectCollector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
