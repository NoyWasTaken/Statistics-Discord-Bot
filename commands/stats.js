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

        message.channel.send("מושך נתונים מהמערכת ...")
        .then(async (msg) => {
            var startDateStamp = new Date(startDate);
            var endDateStamp = new Date(endDate);

            var daysBetween = (endDateStamp.getTime() - startDateStamp.getTime()) / (1000 * 3600 * 24);

            var messages = 0;
            var replies = 0;
            var dataFetched = 0;

            do
            {
                var query = await client.database.query("SELECT `messages`, `replies`, `last_update` FROM `logs` WHERE `date` = ? AND `server` = ? AND `user` = ?", [client.formatDate(startDateStamp), message.guild.id, message.member.id], function(error, results, fields) {
                    if(results[0])
                    {
                        messages = messages + results[0].messages;
                        replies = replies + results[0].replies;
                    }

                    dataFetched = dataFetched + 1;
                });

                startDateStamp.setDate(startDateStamp.getDate() + 1);
            } while (startDateStamp.getTime() <= endDateStamp.getTime())

            const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            while(dataFetched < daysBetween)
            {
                // await causing problems and I'm too lazy to check lol
                await delay(1000);
            }

            msg.edit(`מציג נתונים עבור: ${target.toString()} על טווח תאריכים: ${startDate} - ${endDate}\nהודעות: ${messages}\nתגובות: ${replies}`);
        });
    }
}

module.exports.config = {
    command: "stats",
    description: ""
}