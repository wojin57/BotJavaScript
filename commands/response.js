const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
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
    renameRequest,
} = require("../utils.js");
const { categoryId, adminRoleId } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("응답")
        .setDescription("(관리자 전용)채널 생성 요청을 수락/거절합니다.")
        .addStringOption((option) => {
            option
                .setName("채널명")
                .setDescription("처리할 요청의 채널명을 입력해주세요.")
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

        const requestChannelName = interaction.options.getString("채널명");
        const request = findRequest(requestChannelName);

        const buttons = [
            {
                customId: "approve",
                label: "승인",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    const category =
                        interaction.guild.channels.cache.get(categoryId);
                    createGameChannel(interaction.client, category, request);
                    await interaction.reply("채널 생성 요청을 승인하셨씁니다.");
                    // const modal = new ModalBuilder()
                    //     .setCustomId("responseModal")
                    //     .setTitle("최종 확인")
                    //     .addComponents(
                    //         new ActionRowBuilder().addComponents(
                    //             new TextInputBuilder()
                    //                 .setCustomId("channelName")
                    //                 .setLabel("채널명")
                    //                 .setStyle(TextInputStyle.Short)
                    //                 .setValue(request.channel_name)
                    //         ),
                    //         new ActionRowBuilder().addComponents(
                    //             new TextInputBuilder()
                    //                 .setCustomId("roleName")
                    //                 .setLabel("역할명")
                    //                 .setStyle(TextInputStyle.Short)
                    //                 .setValue(request.role_name)
                    //         )
                    //     );

                    // await interaction.reply({
                    //     content: "Creating text input menus...",
                    //     components: [modal],
                    // });

                    // const response_modal_filter = (interaction) => {
                    //     return interaction.customId === "responseModal";
                    // };

                    // const collector =
                    //     interaction.channel.createMessageComponentCollector({
                    //         filter: response_modal_filter,
                    //         time: 60 * 1000,
                    //     });

                    // collector.on("collect", async (interaction) => {
                    //     const newChannelName =
                    //         interaction.fields.getTextInputValue("channelName");
                    //     const newRoleName =
                    //         interaction.fields.getTextInputValue("roleName");
                    //     renameRequest(request, newChannelName, newRoleName);
                    //     createGameChannel(
                    //         interaction.client,
                    //         category,
                    //         request
                    //     );
                    //     await interaction.reply(
                    //         "채널 생성 요청을 승인하셨습니다."
                    //     );
                    // });

                    // collector.on("end", async (collect) => {
                    //     console.log("timeout!");
                    // });
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

        const responseRow = new ActionRowBuilder().addComponents(
            buttons.map((button) => {
                return new ButtonBuilder()
                    .setCustomId(button.customId)
                    .setLabel(button.label)
                    .setStyle(button.style);
            })
        );

        await interaction.reply({
            content: `${requestChannelName} 채널 생성 요청을 처리해주세요.`,
            components: [responseRow],
        });

        const responseFilter = (interaction) => {
            return buttons.filter(
                (button) => button.customId === interaction.customId
            );
        };

        const responseCollector =
            interaction.channel.createMessageComponentCollector({
                filter: responseFilter,
                time: 60 * 1000,
            });

        responseCollector.on("collect", async (interaction) => {
            const button = buttons.find(
                (button) => button.customId === interaction.customId
            );
            await button.action(interaction);
        });

        responseCollector.on("end", async (collect) => {
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
