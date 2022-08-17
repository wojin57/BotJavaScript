const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("테스트")
        .setDescription("테스트용 명령어입니다.")
        .addIntegerOption((option) =>
            option
                .setName("pagenumber")
                .setDescription("Enter the page number")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)
        ),
    async execute(interaction) {
        const pageNumber = interaction.options.getInteger("pagenumber");

        const buttons = [
            {
                customId: "yeah",
                label: "yes",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    await interaction.reply("You selected yes");
                },
            },
            {
                customId: "nope",
                label: "no",
                style: ButtonStyle.Danger,
                action: async (interaction) => {
                    await interaction.reply("You selected no");
                },
            },
        ];

        const buttonRow = new ActionRowBuilder().addComponents(
            buttons.map((button) => {
                return new ButtonBuilder()
                    .setCustomId(button.customId)
                    .setLabel(button.label)
                    .setStyle(button.style);
            })
        );

        await interaction.reply({
            content: `Button select #${pageNumber}`,
            components: [buttonRow],
        });

        const buttonFilter = (interaction) => {
            return buttons.filter(
                (button) => button.customId === interaction.customId
            );
        };

        const buttonCollector =
            interaction.channel.createMessageComponentCollector({
                filter: buttonFilter,
                time: 60 * 1000,
            });

        buttonCollector.on("collect", async (interaction) => {
            const button = buttons.find(
                (button) => button.customId === interaction.customId
            );
            await button.action(interaction);
        });

        buttonCollector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
