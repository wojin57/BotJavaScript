const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("request")
        .setDescription("Request for creating a new game channel."),
    async execute(interaction) {
        // Using text inputs, ask the user for the name of the channel and the role.
        await interaction.reply("Pong!");

        // python code for request command
        // global requests

        // for channel_name in channel_names:
        //     if request := find_request(channel_name):
        //         request.users.append(ctx.author)
        //     else:
        //         requests.append(
        //             Request(channel_name, role_name=channel_name, req_user=ctx.author))

        // await ctx.send(f"Your requests are successfully added. Please wait for admin's approval.")
    },
};
