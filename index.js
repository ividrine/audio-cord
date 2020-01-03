const discord = require('discord.js');
const bot = new discord.Client();
let BotHelper = require('./lib/BotHelper.js');
const token = process.env.DISCORD_TOKEN;

BotHelper.initialize(bot).then(() => {
    console.log("Initialization complete.");
    bot.login(token);
    bot.on('ready', BotHelper.onReady)
    bot.on('message', BotHelper.onMessage)
 }).catch(err => {
    console.log(err);
 })

    
