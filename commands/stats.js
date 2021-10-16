const { Permissions } = require("discord.js");

module.exports.run = async(client, message, args) => {
    if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
        return message.reply("אין לך גישה לפקודה הזו.");

    if(args.length <= 0 || args.length > 3)
        return message.reply("שימוש לא תקין בפקודה.");

    const mention = message.mentions.members.firstKey();
    const target = message.guild.members.cache.find(u => u.id == mention);

    if(target !== undefined)
    {
        var startDate = client.formatDate();
        var endDate = "";
        if(args.length == 3)
        {
            if(new Date(args[1]) == "Invalid Date" || new Date(args[2]) == "Invalid Date")
                return message.reply("אחד או יותר מהתאריכים שהוזנו אינם תקינים.");

            startDate = args[1];
            endDate = args[2];
        } else {

        }

        var startDateStamp = new Date(startDate);
        startDateStamp.setDate(startDateStamp.getDate());

        var endDateStamp = new Date(endDate);
        endDateStamp.setDate(endDateStamp.getDate() + 1);

        var messages = 0;
        var replies = 0;

        client.database.query("SELECT `messages`, `replies`, `last_update` FROM `logs` WHERE `date` >= ? AND `date` <= ? AND `server` = ? AND `user` = ?", [client.formatDate(startDateStamp), client.formatDate(endDateStamp), message.guild.id, message.member.id], function(error, results, fields) {
            if(error)
            {
                client.log(`Failed to fetch data from database: ${error}`);
            } else {
                results.forEach(result => {
                    messages = messages + result.messages;
                    replies = replies + result.replies;
                });

                return message.reply(`מציג נתונים עבור: ${target.toString()} על טווח תאריכים: ${startDate} - ${endDate}\nהודעות: ${messages}\nתגובות: ${replies}`);
            }
        });
    }
}

module.exports.config = {
    command: "stats",
    description: ""
}