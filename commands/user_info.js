const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user_info")
        .setDescription("Display info about yourself."),
    async execute(interaction) {
        await interaction.reply(
            `Username: ${interaction.user.username}\nID: ${interaction.user.id}`
        );
    },
};
