const { SlashCommandBuilder } = require("discord.js");
const {
    addRequest,
    getRequests,
    findRequest,
    findGameChannels,
} = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("요청")
        .setDescription("새롭게 만들고자 하는 채널을 요청합니다.")
        .addStringOption((option) =>
            option
                .setName("채널명")
                .setDescription("채널 이름을 입력해주세요.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("역할명")
                .setDescription("역할 이름을 입력해주세요.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel_name = interaction.options.getString("채널명");
        const role_name = interaction.options.getString("역할명");
        // if the channel already exists, ask to join instead...
        if (findGameChannels(channel_name)) {
            await interaction.reply("The channel already exists.");
            return;
        }

        const request = findRequest(channel_name);

        if (request) {
            request.members.push(interaction.member);
        } else {
            addRequest({
                channel_name: channel_name,
                role_name: role_name,
                members: [interaction.member],
            });
        }
        await interaction.reply("Your request has been successfully added!");
    },
};
