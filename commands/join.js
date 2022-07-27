const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const { getGameChannels, findGameChannels } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription(
            "Joins the game channels.(will be moved to client.once in index.js)"
        ),
    async execute(interaction) {
        const gameChannels = getGameChannels();

        const select_menu = new SelectMenuBuilder()
            .setCustomId("join_select")
            .setMaxValues(gameChannels.length);

        for (const gameChannel of gameChannels) {
            select_menu.addOptions({
                label: gameChannel.channel.name,
                value: gameChannel.channel.name,
            });
        }

        const row = new ActionRowBuilder().addComponents(select_menu);

        // await interaction.showActionRow(row);
        await interaction.reply({
            content: "Select every channel you want to join.",
            components: [row],
        });

        const join_select_filter = (interaction) => {
            return interaction.customId === "join_select";
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter: join_select_filter,
            time: 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
            interaction.values.map((value) => {
                const gameChannel = findGameChannels(value);
                interaction.member.roles.add(gameChannel.role);
            });
            await interaction.reply("You successfully joined game channels.");
        });

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
