const fs = require("node:fs");
const path = require("node:path");
const { REST } = require("@discordjs/rest");
const { clientId, guildId, token } = require("./config.json");
const { Routes, PermissionsBitField, ChannelType } = require("discord.js");

let gameChannels = []; // Array<{ channel: GuildChannel, role: Role }>
let requests = []; // Array<{ channel_name: String, role_name: String, members: Array<Member>} >

module.exports = {
    getGameChannels() {
        return gameChannels;
    },
    addGameChannel(gameChannel) {
        gameChannels.push(gameChannel);
    },
    deleteGameChannel(gameChannel) {
        gameChannels.splice(gameChannels.indexOf(gameChannel), 1);
    },
    getRequests() {
        return requests;
    },
    addRequest(request) {
        requests.push(request);
    },
    deleteRequest(request) {
        requests.splice(requests.indexOf(request), 1);
    },
    findRequest(channel_name) {
        return requests.find(
            (request) => request.channel_name === channel_name
        );
    },
    initGameChannels(category, roles) {
        for (const channel of category.children.cache.values()) {
            for (const role of roles.cache.values()) {
                if (
                    channel
                        .permissionsFor(role)
                        .has(PermissionsBitField.Flags.ViewChannel) &&
                    role.name != "@everyone"
                ) {
                    gameChannels.push({ channel: channel, role: role });
                    break;
                }
            }
        }
    },
    findGameChannels(channel_name) {
        return gameChannels.find(
            (gameChannel) => gameChannel.channel.name === channel_name
        );
    },
    async createGameChannel(category, request) {
        // create new role
        const role = null;
        category.guild.roles
            .create({
                name: request.role_name,
                //color: you can change the color of the role, too!
            })
            .then(
                () =>
                    (role = category.guild.roles.cache.some(
                        (role) => role.name === request.role_name
                    ))
            )
            .error(console.error);
        console.log(role);

        // create new channel
        const promise_channel = category.guild.channels.create({
            name: request.channel_name,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: category.guild.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: role,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
            parent: category,
        });
        // promise_channel
        //     .then(() => console.log("Successfully created new channel."))
        //     .error(console.error);
        const channel = category.guild.channels.cache.some(
            (channel) => channel.name === request.channel_name
        );
        // update gameChannel
        gameChannels.push({ channel: channel, role: role });

        // update the select menu, reload it
        // channel_manage_select.add_option(label=new_game_channel.channel.name)

        // add the new role to the assigneed members
        for (member of request.members) member.roles.add(role);
        // delete the request
        requests.splice(requests.indexOf(request), 1);
    },

    deployCommands() {
        const commands = [];
        const commandsPath = path.join(__dirname, "commands");
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: "10" }).setToken(token);

        rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        })
            .then(() =>
                console.log("Successfully registered application commands.")
            )
            .catch(console.error);
    },
};
