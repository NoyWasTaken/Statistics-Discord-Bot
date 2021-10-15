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
        client.database.query("CREATE TABLE IF NOT EXISTS `logs` (`id` INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, `server` BIGINT(10) NOT NULL, `user` BIGINT(10) NOT NULL, `messages` INT(10) NOT NULL, `replies` INT(10) NOT NULL, `last_update` INT(10) NOT NULL, UNIQUE(`server`, `user`))", function(error, results, fields) {
            if(error) client.log(`Failed to create MySQL table: ${error}`);

            client.log("Table created successfully.");
        });
    } catch {
        client.log("Failed to open MySQL connection.");
    }

    setInterval(function()
    {
        for(const [guildId, guildData] of Object.entries(client.collectedData))
        {
            for(const [memberId, memberData] of Object.entries(guildData))
            {
                client.log(`Updating collected data for member ${memberId} on guild ${guildId}. Messages: ${memberData["messages"]}, Replies: ${memberData["replies"]}`);
                
                client.database.query("INSERT INTO `logs` (`server`, `user`, `messages`, `replies`, `last_update`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `messages` = `messages` + ?, `replies` = `replies` + ?", 
                [guildId, memberId, memberData["messages"], memberData["replies"], 0, memberData["messages"], memberData["replies"]], function(error, results, fields) {
                    if(error) 
                    {
                        client.log(`Failed to update data: ${error}`);
                    } else {
                        client.log("Data updated successfully.");
                        client.collectedData[guildId][memberId] = { "messages": 0, "replies": 0 };
                    }
                });
            }
        }
    }, client.settings.update_interval)
}