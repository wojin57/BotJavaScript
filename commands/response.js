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
    renameRequest,
} = require("../utils.js");
const { categoryId, adminRoleId } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("응답")
        .setDescription(
            "(/응답 [기존채널명] <새채널명> <새역할명>) 채널 생성 요청을 수락/거절하는 관리자 전용 명령어입니다."
        )
        .addStringOption((option) => {
            option
                .setName("기존채널명")
                .setDescription("처리할 요청의 원래 채널명을 입력해주세요.")
                .setRequired(true);
            for (const request of getRequests()) {
                option.addChoices({
                    name: request.channel_name,
                    value: request.channel_name,
                });
            }

            console.log(`choices: ${option.choices}`); // for debugging
            return option;
        })
        .addStringOption((option) =>
            option
                .setName("새채널명")
                .setDescription("채널명을 바꾸고 싶을 경우에만 입력해주세요.")
        )
        .addStringOption((option) =>
            option
                .setName("새역할명")
                .setDescription("역할명을 바꾸고 싶을 경우에만 입력해주세요.")
        ),
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

        const requestChannelName = interaction.options.getString("기존채널명");
        const newChannelName = interaction.options.getString("새채널명");
        const newRoleName = interaction.options.getString("새역할명");
        const request = findRequest(requestChannelName);

        const buttons = [
            {
                customId: "approve",
                label: "승인",
                style: ButtonStyle.Success,
                action: async (interaction) => {
                    const category =
                        interaction.guild.channels.cache.get(categoryId);

                    renameRequest(request, newChannelName, newRoleName);
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
    },
};
