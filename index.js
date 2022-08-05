const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token, categoryId, generalChannelId } = require("./config.json");
const { initGameChannels, deployCommands } = require("./utils.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    console.log("Ready!");
    // need to be changed in config.json for real use
    const category = client.channels.cache.get(categoryId);
    const roles = category.guild.roles;
    initGameChannels(client, category, roles);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.channel.id === generalChannelId) {
        await interaction.reply({
            content: "명령어 채널에서 사용해주세요.",
            ephemeral: true,
        });
        return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
        deployCommands();
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content:
                "명령어 실행 중에 에러가 발생했습니다! 봇 관리자에게 문의해주세요.",
            ephemeral: true,
        });
    }
});

client.login(token);
