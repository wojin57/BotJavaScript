const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("테스트")
        .setDescription("테스트용 명령어입니다."),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("test")
            .setTitle("modal title")
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("input1")
                        .setLabel("input1")
                        .setStyle(TextInputStyle.Short)
                        .setValue("value1")
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("input2")
                        .setLabel("input2")
                        .setStyle(TextInputStyle.Short)
                        .setValue("value2")
                )
            );

        interaction.reply({
            content: "test",
            components: [modal],
        });
    },
};
