const { SlashCommandBuilder } = require("discord.js");
const { getGameChannels, getRequests } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("display")
        .setDescription("Display current game channels and requests."),
    async execute(interaction) {
        const gameChannelNames = getGameChannels().map(
            (gameChannel) => gameChannel.channel.name
        );
        await interaction.reply(
            `Game Channels: ${gameChannelNames}\nRequests: ${getRequests()}`
        );
    },
};
