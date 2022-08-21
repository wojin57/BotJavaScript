const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("테스트")
        .setDescription("테스트용 명령어입니다."),
    async execute(interaction) {
        const value = "Some value here";
        const fields = [
            { name: "Regular field title", value: "Some value here" },
            { name: "\u200B", value: "\u200B" },
            {
                name: "Inline field title",
                value: value,
                inline: true,
            },
            {
                name: "Inline field title",
                value: value,
                inline: true,
            },
        ];
        const exampleEmbed = new EmbedBuilder()
            .setTitle("Some title")
            .setDescription("Some description here")
            //.addFields(fields)
            .addFields({
                name: "Inline field title",
                value: "Some value here",
                inline: true,
            });

        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
