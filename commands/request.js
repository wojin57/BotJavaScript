const { SlashCommandBuilder } = require("discord.js");
const {
    addRequest,
    getRequests,
    findRequest,
    findGameChannels,
} = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("request")
        .setDescription("Request for creating a new game channel.")
        .addStringOption((option) =>
            option
                .setName("channel_name")
                .setDescription("Please enter the channel name.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("role_name")
                .setDescription("Please enter the channel name.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel_name = interaction.options.getString("channel_name");
        const role_name = interaction.options.getString("role_name");
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
