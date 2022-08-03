const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const {
    getGameChannels,
    findGameChannels,
    getJoinedGameChannels,
} = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("manage")
        .setDescription("Manage the status of joining game channels."),
    async execute(interaction) {
        const gameChannels = getGameChannels();

        const select_menu = new SelectMenuBuilder()
            .setCustomId("join_select")
            .setMaxValues(gameChannels.length);

        for (const gameChannel of gameChannels) {
            select_menu.addOptions({
                label: gameChannel.channel.name,
                value: gameChannel.channel.name,
                default: interaction.member.roles.cache.some(
                    (role) => role === gameChannel.role
                ),
            });
        }

        const row = new ActionRowBuilder().addComponents(select_menu);

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
            const beforeGameChannels = getJoinedGameChannels(
                interaction.member
            );
            let afterGameChannels = [];
            interaction.values.map((value) =>
                afterGameChannels.push(findGameChannels(value))
            );
            let joinGameChannels = [];
            let leaveGameChannels = [];

            for (const gameChannel of afterGameChannels) {
                if (!beforeGameChannels.includes(gameChannel)) {
                    joinGameChannels.push(gameChannel);
                }
            }
            for (const gameChannel of beforeGameChannels) {
                if (!afterGameChannels.includes(gameChannel)) {
                    leaveGameChannels.push(gameChannel);
                }
            }

            for (const gameChannel of joinGameChannels) {
                interaction.member.roles.add(gameChannel.role);
            }
            for (const gameChannel of leaveGameChannels) {
                interaction.member.roles.remove(gameChannel.role);
            }
            await interaction.reply(
                "Successfully joined/leaved game channels."
            );
        });

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
    },
};
