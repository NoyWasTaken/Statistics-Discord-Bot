const settings = require("./includes/config.json");
const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client({ 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'], 
    intents: Object.keys(Discord.Intents.FLAGS)
});

client.commands = new Discord.Collection();
client.settings = settings;
client.database = mysql.createConnection({
	host: client.settings.mysql_host,
	user: client.settings.mysql_user,
	password: client.settings.mysql_pass,
	database: client.settings.mysql_dbname
})

client.collectedData = {}

client.log = (message) => {
	var formattedDate = new Date().toISOString().
	replace(/T/, ' ').      // replace T with a space
	replace(/\..+/, '')

	console.log(`[${formattedDate}] ${message}`);
}

client.formatDate = (date=null) => {
	return date != null ? date.toLocaleDateString("en-US") : new Date().toLocaleDateString('en-US');
}

fs.readdir('./commands/', (err, files) => {
	if(err) console.error(err);
	
	var jsFiles = files.filter(f => f.split('.').pop() === 'js');
	if(jsFiles.length <= 0)
		return client.log("No commands found.");
	else
		client.log(`Found ${jsFiles.length} commands:`);
	
	jsFiles.forEach((f, i) => {
		var cmds = require(`./commands/${f}`);
		client.log(`Loaded command ${f}`);
		
		client.commands.set(cmds.config.command, cmds);
	});
});

fs.readdir('./events/', (err, files) => {
	if(err) console.error(err);
	
	var jsFiles = files.filter(f => f.split('.').pop() === 'js');
	if(jsFiles.length <= 0)
		return client.log("No events found.");
	else
		client.log(`Found ${jsFiles.length} events:`);
	
	jsFiles.forEach((f, i) => {
		var event = require(`./events/${f}`);
		client.log(`Loaded event ${f}`);
		
		client.on(f.split(".")[0], event.bind(null, client));
	});
});

client.on('messageCreate', async message => {
	if(!message.channel || !message.member || message.author.bot)
		return;
	
	if(IsCommand(message))
	{
		var cont = message.content.slice(client.settings.prefix.length).split(" "); // removes prefix then giving an array, cont[0] = command. the rest is the args
		var args = cont.slice(1);
		
		var cmd = client.commands.get(cont[0]);
		if(cmd) cmd.run(client, message, args);
	} else {
		// ignore commands while collecting statistics data
		if(!client.collectedData[message.guild.id])
			client.collectedData[message.guild.id] = {}

		if(!client.collectedData[message.guild.id][message.member.id])
			client.collectedData[message.guild.id][message.member.id] = {"messages": 0, "replies": 0, "last_update": 0};

		if(message.type == "REPLY")
			client.collectedData[message.guild.id][message.member.id]["replies"] = client.collectedData[message.guild.id][message.member.id]["replies"] + 1;
		else
			client.collectedData[message.guild.id][message.member.id]["messages"] = client.collectedData[message.guild.id][message.member.id]["messages"] + 1;
	}
});

function IsCommand(message) {
	return message.content.toLowerCase().startsWith(client.settings.prefix);
}

client.log(`Logining in using token: ${client.settings.token}`);
client.log(`Using command prefix: ${client.settings.prefix}`);
client.login(client.settings.token);