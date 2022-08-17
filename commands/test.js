const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("테스트")
        .setDescription("테스트용 명령어입니다."),
    async execute(interaction) {
        shit();
    },
};
