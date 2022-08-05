const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
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

        const numMenus = gameChannels.length / 24;
        const select_menus = [];
        for (let i = 0; i < numMenus; i++) {
            const maxValue = i == numMenus - 1 ? gameChannels.length % 24 : 24;
            const select_menu = new SelectMenuBuilder()
                .setCustomId(`join_select_${i}`)
                .setMaxValues(maxValue);
            select_menus.push(select_menu);
        }

        let countChannel = 0;
        for (let select_menu of select_menus) {
            select_menu.addOptions({
                label: "해당업음",
                value: "해당없음",
            });

            let gameChannel = gameChannels[countChannel++];
            select_menu.addOptions({
                label: gameChannel.channel.name,
                value: gameChannel.channel.name,
                default: interaction.member.roles.cache.some(
                    (role) => role === gameChannel.role
                ),
            });
        }

        const row = new ActionRowBuilder().addComponents(select_menu);

        await interaction.reply({
            content: "참가할 채널만 모두 선택해주세요.",
            components: [row],
        });

        const join_select_filter = (interaction) => {
            return interaction.customId === "join_select";
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter: join_select_filter,
            time: 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
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

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
