const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription(
            "Joins the game channels.(will be moved to client.once in index.js)"
        ),
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder().setCustomId("join_select").addOptions(
                {
                    label: "",
                    description: "",
                    value: "",
                },
                {
                    label: "",
                    description: "",
                    value: "",
                }
            )
        );

        // how the command actually works!
        await interaction.reply({ content: "Pong!", components: [row] });
    },
};
