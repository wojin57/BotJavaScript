const { SlashCommandBuilder } = require("discord.js");
const { getGameChannels, getRequests } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("display")
        .setDescription("Display current game channels and requests."),
    async execute(interaction) {
        const gameChannels = getGameChannels();
        const requests = getRequests();
        await interaction.reply({ content: { gameChannels, requests } });
    },
};
