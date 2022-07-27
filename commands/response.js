const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    ButtonBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle,
} = require("discord.js");
const {
    getRequests,
    findRequest,
    createGameChannel,
    deleteRequest,
} = require("../utils.js");
const { categoryId } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("response")
        .setDescription(
            "(ADMIN ONLY)Approve/deny for creating a new game channel."
        )
        //.setDefaultMemberPermissions() to make the command available only to admin
        .addStringOption((option) => {
            option
                .setName("request_channel_name")
                .setDescription(
                    "Please enter the requested channel name to response."
                )
                .setRequired(true);
            for (const request of getRequests()) {
                option.addChoices({
                    name: request.channel_name,
                    value: request.channel_name,
                });
            }
            return option;
        }),
    async execute(interaction) {
        const request_channel_name = interaction.options.getString(
            "request_channel_name"
        );
        const request = findRequest(request_channel_name);

        const buttons = [
            {
                customId: "approve",
                label: "Approve",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    const category =
                        interaction.guild.channels.cache.get(categoryId);
                    createGameChannel(category, request);
                    await interaction.reply("You have approved the request.");
                },
            },
            {
                customId: "deny",
                label: "Deny",
                style: ButtonStyle.Danger,
                action: async (interaction) => {
                    deleteRequest(request);
                    await interaction.reply("You have denied the request.");
                },
            },
        ];

        const response_row = new ActionRowBuilder().addComponents(
            buttons.map((button) => {
                return new ButtonBuilder()
                    .setCustomId(button.customId)
                    .setLabel(button.label)
                    .setStyle(button.style);
            })
        );

        await interaction.reply({
            content: `Do you want to approve or deny the request for ${request_channel_name}?`,
            components: [response_row],
        });

        const response_filter = (interaction) => {
            return buttons.filter(
                (button) => button.customId === interaction.customId
            );
        };

        const response_collector =
            interaction.channel.createMessageComponentCollector({
                filter: response_filter,
                time: 60 * 1000,
            });

        response_collector.on("collect", async (interaction) => {
            const button = buttons.find(
                (button) => button.customId === interaction.customId
            );
            await button.action(interaction);
        });

        response_collector.on("end", async (collect) => {
            console.log("timeout!");
        });

        /*
        const modal = new ModalBuilder()
            .setCustomId("response_modal")
            .setTitle("Create a new game channel")
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("channel_name")
                        .setLable("Channel name")
                        .setStyle(TextInputStyle.Short)
                        .setValue(request.channel_name)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("role_name")
                        .setLable("Role name")
                        .setStyle(TextInputStyle.Short)
                        .setValue(request.role_name)
                )
            );
        //await interaction.showModal(modal);

        await interaction.reply({
            content: "Creating text input menus...",
            components: modal.components,
        });

        const response_modal_filter = (interaction) => {
            return interaction.customId === "response_modal";
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter: response_modal_filter,
            time: 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
            interaction.values.map((value) => {});
            await interaction.reply(
                "You successfully responsed game channels."
            );
        });

        collector.on("end", async (collect) => {
            console.log("timeout!");
        });
        */
    },
};
