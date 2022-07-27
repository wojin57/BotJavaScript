const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const { getGameChannels, findGameChannels } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("(ADMIN ONLY)Removes the game channels."),
    //.setDefaultMemberPermissions()
    async execute(interaction) {
        const gameChannels = getGameChannels();

        const select_menu = new SelectMenuBuilder()
            .setCustomId("delete_select")
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
            content: "Select every channel you want to delete.",
            components: [row],
        });

        const delete_select_filter = (interaction) => {
            return interaction.customId === "delete_select";
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter: delete_select_filter,
            time: 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
            interaction.values.map((value) => {
                const gameChannel = findGameChannels(value);
                gameChannel.channel
                    .delete()
                    .then((deleted) =>
                        console.log(`Deleted Channel ${deleted.name}`)
                    )
                    .error(console.error);
                gameChannel.role
                    .delete()
                    .then((deleted) =>
                        console.log(`Deleted Role ${deleted.name}`)
                    )
                    .error(console.error);
            });
            await interaction.reply("You successfully deleted game channels.");
        });

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};