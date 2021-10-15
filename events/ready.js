const {Permissions} = require("discord.js")

module.exports = async (client) => {
    client.log(`Bot is ready! Username: ${client.user.username}#${client.user.discriminator}`);

    const link = client.generateInvite({
        permissions: [Permissions.FLAGS.ADMINISTRATOR],
        scopes: ['bot']
	});
    
    client.log(`Generated invite url: ${link}`);
}