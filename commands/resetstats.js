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
        var startDate = "";
        var endDate = "";
        if(args.length == 3)
        {
            if(new Date(args[1]) == "Invalid Date" || new Date(args[2]) == "Invalid Date")
                return message.reply("אחד או יותר מהתאריכים שהוזנו אינם תקינים.");

            startDate = args[1];
            endDate = args[2];
        } else {
            endDate = client.formatDate();
            startDateObj = new Date();

            switch(args[1])
            {
                case "day":
                    startDateObj.setDate(startDateObj.getDate() - 1);
                    break;

                case "week":
                    startDateObj.setDate(startDateObj.getDate() - 7);
                    break;

                case "month":
                    startDateObj.setDate(startDateObj.getDate() - 30);
                    break;

                case "year":
                    startDateObj.setDate(startDateObj.getDate() - 365);
                    break;
            }

            startDate = client.formatDate(startDateObj);
        }

        message.channel.send("מבצע מחיקה לנתונים ...")
        .then(async (msg) => {
            var startDateStamp = new Date(startDate);
            var endDateStamp = new Date(endDate);

            do
            {
                await client.database.query("UPDATE `logs` SET `messages` = 0, `replies` = 0 WHERE `date` = ? AND `server` = ? AND `user` = ?", [client.formatDate(startDateStamp), message.guild.id, message.member.id], function(error, results, fields) {
                    if(error)
                    {
                        msg.edit("אירעה שגיאת בעת מחיקת הנתונים.");
                        return;
                    }
                });
                if(client.formatDate(startDateStamp) == client.formatDate())
                {
                    client.collectedData[message.guild.id][message.member.id]["replies"] = 0;
                    client.collectedData[message.guild.id][message.member.id]["messages"] = 0;
                }
                
                startDateStamp.setDate(startDateStamp.getDate() + 1);
            } while (startDateStamp.getTime() <= endDateStamp.getTime())

            msg.edit(`הנתונים של: ${target.toString()} בטווח התאריכים: ${startDate} - ${endDate} אופסו.`);
        });
    }
}

module.exports.config = {
    command: "resetstats",
    description: ""
}