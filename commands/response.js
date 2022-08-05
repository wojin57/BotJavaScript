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
const { categoryId, adminRoleId } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("응답")
        .setDescription("(관리자 전용)채널 생성 요청을 수락/거절합니다.")
        .addStringOption((option) => {
            option
                .setName("채널명")
                .setDescription(
                    "(/응답 [채널명]) 처리할 요청의 채널명을 입력해주세요."
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
        if (
            !interaction.member.roles.cache.some(
                (role) => role.id === adminRoleId
            )
        ) {
            await interaction.reply({
                content: "관리자만 사용할 수 있습니다.",
                ephemeral: true,
            });
            return;
        }

        const request_channel_name = interaction.options.getString("채널명");
        const request = findRequest(request_channel_name);

        const buttons = [
            {
                customId: "approve",
                label: "승인",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    const category =
                        interaction.guild.channels.cache.get(categoryId);
                    createGameChannel(interaction.client, category, request);
                    await interaction.reply("채널 생성 요청을 승인하셨습니다.");
                },
            },
            {
                customId: "deny",
                label: "거절",
                style: ButtonStyle.Danger,
                action: async (interaction) => {
                    deleteRequest(request);
                    await interaction.reply("채널 생성 요청을 거절하셨습니다.");
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
            content: `${request_channel_name} 채널 생성 요청을 처리해주세요.`,
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

        // const modal = new ModalBuilder()
        //     .setCustomId("response_modal")
        //     .setTitle("Create a new game channel")
        //     .addComponents(
        //         new ActionRowBuilder().addComponents(
        //             new TextInputBuilder()
        //                 .setCustomId("channel_name")
        //                 .setLable("채널명")
        //                 .setStyle(TextInputStyle.Short)
        //                 .setValue(request.channel_name)
        //         ),
        //         new ActionRowBuilder().addComponents(
        //             new TextInputBuilder()
        //                 .setCustomId("role_name")
        //                 .setLable("역할명")
        //                 .setStyle(TextInputStyle.Short)
        //                 .setValue(request.role_name)
        //         )
        //     );

        // await interaction.reply({
        //     content: "Creating text input menus...",
        //     components: [modal],
        // });

        // const response_modal_filter = (interaction) => {
        //     return interaction.customId === "response_modal";
        // };

        // const collector = interaction.channel.createMessageComponentCollector({
        //     filter: response_modal_filter,
        //     time: 60 * 1000,
        // });

        // collector.on("collect", async (interaction) => {
        //     //interaction.values.map((value) => {});
        //     await interaction.reply("성공적으로 요청을 처리했습니다.");
        // });

        // collector.on("end", async (collect) => {
        //     console.log("timeout!");
        // });
    },
};
