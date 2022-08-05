const { SlashCommandBuilder } = require("discord.js");
const { getGameChannels, getRequests } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("목록")
        .setDescription("게임 채널 목록과 요청 목록을 보여줍니다."),
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
            `채널 목록: ${gameChannelNames}\n요청 목록: ${requestsToString}`
        );
    },
};
