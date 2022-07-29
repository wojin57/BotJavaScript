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
        const requestsToString = getRequests().map(
            (request) =>
                `${request.channel_name} - ${
                    request.role_name
                } - ${request.members.map((member) => member.displayName)}`
        );
        await interaction.reply(
            `Game Channels: ${gameChannelNames}\nRequests: ${requestsToString}`
        );
    },
};
