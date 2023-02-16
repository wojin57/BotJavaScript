const { SlashCommandBuilder } = require("discord.js");

const choice = [
    {
        name: "test1",
        value: "value1",
    },
    {
        name: "test2",
        value: "value2",
    },
    {
        name: "test3",
        value: "value3",
    },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("테스트")
        .setDescription("테스트용 명령어입니다.")
        .addStringOption((option) => {
            option
                .setName("test")
                .setDescription("description for test option")
                .setRequired(true);
            for (const c of choice) {
                option.addChoices(c);
            }

            return option;
        }),
    async execute(interaction) {
        const inputString = interaction.options.getString("test");
        await interaction.reply(inputString);
    },
};
