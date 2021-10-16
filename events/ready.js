const {Permissions} = require("discord.js")

module.exports = async (client) => {
    client.log(`Bot is ready! Username: ${client.user.username}#${client.user.discriminator}`);

    const link = client.generateInvite({
        permissions: [Permissions.FLAGS.ADMINISTRATOR],
        scopes: ['bot']
	});
    
    client.log(`Generated invite url: ${link}`);

    client.log("Trying to create database connection ...");
    try 
    {
        client.database.connect();
        client.log("Openned connection successfully.");

        client.log("Trying to create MySQL tables.");
        client.database.query("CREATE TABLE IF NOT EXISTS `logs` (`id` INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, `date` VARCHAR(32) NOT NULL, `server` BIGINT(10) NOT NULL, `user` BIGINT(10) NOT NULL, `messages` INT(10) NOT NULL, `replies` INT(10) NOT NULL, `last_update` BIGINT(10) NOT NULL, UNIQUE(`date`, `server`, `user`))", function(error, results, fields) {
            if(error) client.log(`Failed to create MySQL table: ${error}`);

            client.log("Table created successfully.");
        });
    } catch {
        client.log("Failed to open MySQL connection.");
    }

    client.log("Trying to fetch existing data from database ...");
    try
    {
        client.database.query("SELECT `user`, `server`, `last_update` FROM `logs` WHERE `date` = ?", [client.formatDate()], function(error, results, fields) {
            if(error)
            {
                client.log(`Failed to fetch data from database: ${error}`);
            } else {
                results.forEach(row => {
                    if(!client.collectedData[row.server])
                        client.collectedData[row.server] = {}
                    
                    client.log(`Fetched data for member: ${row.user} on guild ${row.server}: Last Update: ${row.last_update}`);
                    client.collectedData[row.server][row.user] = {"messages": 0, "replies": 0, "last_update": row.last_update};
                });

                client.guilds.cache.forEach(guild => {
                    guild.channels.cache.forEach(channel => {
                        if(channel.messages)
                        {
                            channel.messages.fetch(undefined, {
                                cache: false,
                                force: true
                            }).then(messages => {
                                messages.forEach(message => {
                                    if(message.member && !message.author.bot && !client.IsCommand(message))
                                    {
                                        if(!client.collectedData[message.guild.id])
                                            client.collectedData[message.guild.id] = {}
            
                                        if(!client.collectedData[message.guild.id][message.member.id])
                                            client.collectedData[message.guild.id][message.member.id] = {"messages": 0, "replies": 0, "last_update": 0};
            
                                        if(message.createdTimestamp > client.collectedData[message.guild.id][message.member.id]["last_update"])
                                        {
                                            if(message.type == "REPLY")
                                                client.collectedData[message.guild.id][message.member.id]["replies"] = client.collectedData[message.guild.id][message.member.id]["replies"] + 1;
                                            else
                                                client.collectedData[message.guild.id][message.member.id]["messages"] = client.collectedData[message.guild.id][message.member.id]["messages"] + 1;
                                        }
                                    }
                                });
                            })
                        }
                    });
                });
            }
        });
    } catch {
        client.log("Failed to fetch data from database.");
    }

    setInterval(function()
    {
        for(const [guildId, guildData] of Object.entries(client.collectedData))
        {
            for(const [memberId, memberData] of Object.entries(guildData))
            {
                client.log(`Updating collected data for member ${memberId} on guild ${guildId}. Messages: ${memberData["messages"]}, Replies: ${memberData["replies"]}`);
                
                var timeStamp = new Date().getTime();
                client.database.query("INSERT INTO `logs` (`server`, `user`, `messages`, `replies`, `last_update`, `date`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `messages` = `messages` + ?, `replies` = `replies` + ?, `last_update` = ?", 
                [guildId, memberId, memberData["messages"], memberData["replies"], timeStamp, client.formatDate(), memberData["messages"], memberData["replies"], timeStamp], function(error, results, fields) {
                    if(error) 
                    {
                        client.log(`Failed to update data: ${error}`);
                    } else {
                        client.log("Data updated successfully.");
                        client.collectedData[guildId][memberId] = { "messages": 0, "replies": 0, "last_update": timeStamp };
                    }
                });
            }
        }
    }, client.settings.update_interval)
}