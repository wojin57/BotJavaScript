const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    ButtonBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const { getRequests, findRequest } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("response")
        .setDescription(
            "(ADMIN ONLY)Approve/deny for creating a new game channel."
        )
        //.setDefaultMemberPermissions() to make the command available only to admin
        .addStringOption((option) =>
            option
                .setName("request_channel_name")
                .setDescription(
                    "Please enter the requested channel name to response."
                )
                .setRequired(true)
                .addChoices
                //ㅋㅋ 너가 문제래 시발
                //getRequests().map((request) => request.channel_name)
                ()
        ),
    async execute(interaction) {
        const request_channel_name = interaction.options.getString(
            "request_channel_name"
        );
        const request = findRequest(request_channel_name);
        const modal = new ModalBuilder()
            .setCustomId("response_modal")
            .setTitle("Create a new game channel")
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("channel_name")
                        .setLable("Channel name")
                        .setStyle(TextInputStyle.Short)
                        .setValue(request.channel_name)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("role_name")
                        .setLable("Role name")
                        .setStyle(TextInputStyle.Short)
                        .setValue(request.role_name)
                )
            );
        await interaction.showModal(modal);

        await interaction.reply(
            "Successfully responded to the request for creating a new game channel."
        );
    },
};
