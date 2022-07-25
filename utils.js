const { PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
    initGameChannels(category, roles, bots) {
        const helper_bot_role_id = "997484583224356876";
        const helper_py_bot_role_id = "997559654278246513";

        let gameChannels = [];
        let bot_role_ids = [helper_bot_role_id, helper_py_bot_role_id];
        for (const bot of bots.values()) {
            bot_role_ids.push(bot._roles[0]); // assume that bot's role is the first one
        }

        for (const channel of category.children.cache.values()) {
            console.log(channel.name);
            for (const role of roles.cache.values()) {
                console.log(role.name);
                console.log(channel.permissionsFor(role));
            }
        }

        // for (const channel of category.children.cache.values()) {
        //     for (const role of roles.cache.values()) {
        //         let id_is_bot = false;
        //         for (const id of bot_role_ids) {
        //             if (role.id === id) {
        //                 id_is_bot = true;
        //                 break;
        //             }
        //         }
        //         if (
        //             role
        //                 .permissionsIn(channel)
        //                 .has(PermissionsBitField.Flags.SendMessages) &&
        //             role.name != "@everyone" &&
        //             !id_is_bot
        //         ) {
        //             console.log(
        //                 `role name: ${role.name}, id: ${role.id}, channel name: ${channel.name}, channel id: ${channel.id}`
        //             );
        //             gameChannels.push({ channel: channel, role: role });
        //             break;
        //         }
        //     }
        // }

        console.log("channel name: role name");
        for (const gameChannel of gameChannels) {
            console.log(
                `${gameChannel.channel.name}: ${gameChannel.role.name}`
            );
        }
        return gameChannels;
    },
    addChannel(gameChannels, requests, category, request) {
        // create new role with appropriate permissions channel and role, update channel_manage_select
        const role = category.guild.roles
            .create({
                name: request.role.name,
                //color: you can change the color of the role, too!
            })
            .then(console.log)
            .error(console.error);

        // secret_overwrites = {
        //     category.guild.default_role: discord.PermissionOverwrite(read_messages=False),
        //     new_role: discord.PermissionOverwrite(read_messages=True),
        // }

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

        // remove requests global varwiables
        for (user of request.users) user.roles.add(role);
        requests.remove(request);
    },
};
