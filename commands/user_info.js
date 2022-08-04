const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user_info")
        .setDescription("삭제될 명령어입니다."),
    async execute(interaction) {
        await interaction.reply(
            `Username: ${interaction.member.displayName}\nID: ${interaction.member.id}`
        );
    },
};
