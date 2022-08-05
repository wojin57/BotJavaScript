const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const {
    getGameChannels,
    findGameChannels,
    deleteGameChannel,
} = require("../utils.js");
const { adminRoleId } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("삭제")
        .setDescription("(관리자 전용)사용하지 않는 채널을 삭제합니다."),
    async execute(interaction) {
        if (
            !interaction.member.roles.cache.some(
                (role) => role.id === adminRoleId
            )
        ) {
            await interaction.reply({
                content: "관리자만 사용할 수 있습니다.",
                ephemeral: true,
            });
            return;
        }

        const gameChannels = getGameChannels();

        const select_menu = new SelectMenuBuilder()
            .setCustomId("delete_select")
            .setMaxValues(gameChannels.length);

        for (const gameChannel of gameChannels) {
            select_menu.addOptions({
                label: gameChannel.channel.name,
                value: gameChannel.channel.name,
            });
        }

        const row = new ActionRowBuilder().addComponents(select_menu);
        await interaction.reply({
            content: "삭제할 채널들을 선택해주세요.",
            components: [row],
        });

        const delete_select_filter = (interaction) => {
            return interaction.customId === "delete_select";
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter: delete_select_filter,
            time: 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
            interaction.values.map((value) =>
                deleteGameChannel(findGameChannels(value))
            );
            await interaction.reply("성공적으로 채널을 삭제했습니다.");
        });

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
