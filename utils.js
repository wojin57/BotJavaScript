const { PermissionsBitField, ChannelType } = require("discord.js");

let gameChannels = []; // Array<{ channel: GuildChannel, role: Role }>
let requests = []; // Array<{ channel_name: String, role_name: String, users: Array<User>} >

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
    addChannel(requests, category, request) {
        // create new role
        const role = category.guild.roles
            .create({
                name: request.role.name,
                //color: you can change the color of the role, too!
            })
            .then(console.log)
            .error(console.error);

        // create new channel
        const channel = category.guild.channels
            .create({
                name: request.channel.name,
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
            })
            .then(console.log())
            .error(console.error);

        // update gameChannel
        gameChannels.push({ channel: channel, role: role });

        // update the select menu, reload it
        // channel_manage_select.add_option(label=new_game_channel.channel.name)

        // remove requests global variables
        for (user of request.users) user.roles.add(role);
        requests.remove(request);
    },
};
