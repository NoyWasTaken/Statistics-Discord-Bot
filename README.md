# Discord Statistics Bot
A simple statistics bot for discord collecting information about a client's daily replies and messages seperated by servers.
# Opreation
The bot will run using a MySQL database to collect and save it's data.

The data will be saved to a table each day and will be saved using the user's discord is, the server's discord id, the amount of the messages he sent, the amount of replies he sent and the current timestamp to know when was it last update.

Every time the bot starts up it will check every user in the database to try and detected new messages from the last time the user was updated and current time (uptime of the bot).

This is to prevent missing data in case of crash or connection errors with discord's API servers.

The bot is built dynamiclly and can be running in mulitple servers even if it's planned to be running on only one.

# Commands
The bot will be provided with commands allows the manager to track the statistics of an user by selecting custom dates or by selecting a time with custom words such as: day, week, month, year etc ...
The bot will be provided with commands to reset the statistics of a user - the entire statistics or the data of specifics time.
```
- stats @user day/week/month/year/all
- stats @user {START_DATE} {END_DATE}
- resetstats @user day/week/month/year/all
- resetstats @user {START_DATE} {END_DATE}
- resetstats_all
```

# Tables
Tables of the database will be openned automatticly by using the code.
The system will use a config file (JSON formatted) to receive the details of the database and by using them it will create a connection and send the required queries such as table creations, data update or insert and so.
## logs
###### id - int auto increment
###### server - int
###### user - int 
###### messages - int
###### replies - int
###### last_update - int

# Dev Notes
Running and developing the bot will be using Git to manage the code.
The master branch will reflect the production and a branch named "develop" will reflect the development.
For each feature, bug fix or any change after the upload for production will be in different branches and merged into the develop branch.
For every release and update there will be a merge request from the develop to the master branch that will need approval of the project's manager.
The bot will be written in NodeJS using the latest Discord.JS library
