const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getGameChannels, getRequests } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("목록")
        .setDescription("게임 채널 목록과 요청 목록을 보여줍니다."),
    async execute(interaction) {
        const gameChannelNames = getGameChannels().map(
            (gameChannel) => gameChannel.channel.name
        );

        let requestsToString = getRequests()
            .map(
                (request) =>
                    `${request.channel_name}(${
                        request.role_name
                    }): ${request.members.map((member) => member.displayName)}`
            )
            .join("\n");

        if (!requestsToString) {
            requestsToString = "없음";
        }

        let fields = [];
        const maxPage = Math.floor(gameChannelNames.length / 25) + 1;
        for (let i = 0; i < maxPage; i++) {
            const numChannels =
                i === maxPage - 1 ? gameChannelNames.length % 25 : 25;
            fields.push({
                name: `채널 목록 (페이지 ${i + 1}/${maxPage})`,
                value: gameChannelNames
                    .slice(i * 25, i * 25 + numChannels)
                    .join(", "),
                inline: false,
            });
        }
        fields.push({
            name: "요청 목록",
            value: requestsToString,
            inline: false,
        });
        const displayEmbed = new EmbedBuilder().addFields(fields);

        await interaction.reply({ embeds: [displayEmbed] });
    },
};
