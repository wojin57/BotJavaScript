const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("봇이 살아있으면 대답해줍니다."),
    async execute(interaction) {
        await interaction.reply("Pong!");
    },
};
