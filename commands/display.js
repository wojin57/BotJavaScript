const { SlashCommandBuilder } = require("discord.js");
const { getGameChannels, getRequests } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("display")
        .setDescription("Display current game channels and requests."),
    async execute(interaction) {
        //const gameChannels = getGameChannels();
        //const requests = getRequests();
        console.log("Game Channels--------------------");
        for (const gameChannel of getGameChannels()) {
            console.log(gameChannel.channel.name);
        }
        console.log("Requests-------------------------");
        console.log(getRequests());
        await interaction.reply("display example(DEBUGGING)");
    },
};
