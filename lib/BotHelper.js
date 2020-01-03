let MongoPool = require('./MongoPool.js');
let DiscordServer = require('./DiscordServer.js');
const prefix = '!';
let ds;
let bot;

const COMMANDS = {
    AUDIO: {
        NAME: 'audio',
        OPTIONS: {
            PLAY: 'play',
            LIST: 'list',
            ADD: 'add',
            DELETE: 'delete'
        }
    },
    HELP: {
        NAME: 'help'
    }
}

module.exports = {

    initialize: (_bot) => {
        return new Promise((resolve, reject) => {
            MongoPool.connect().then(_db => {
                ds = new DiscordServer(_db);
                bot = _bot;
                resolve();
            }).catch(err => {
                reject(err);
            })
        })
    },

    onReady: () => {
        if (!ds) {
            console.log("Discord Server not ready.")
        } else {
            bot.guilds.forEach(async (value, key) => {
                await ds.addServer(key, value.name);
            })
            console.log("Servers added!")
        }
    },

    onMessage: (msg) => {

        if (msg.author.bot) return;

        let serverid = msg.guild.id;
        let msgArray = msg.content.split(/\s+/g);
        let command = msgArray[0];
        let args = msgArray.splice(1);

        if (!command.startsWith(prefix)) return;

        command = command.replace(prefix, '');

        if (command == COMMANDS.AUDIO.NAME) {

            if (!args[0]) return;

            let option = args[0];
            args = args.splice(1);

            if (option == COMMANDS.AUDIO.OPTIONS.PLAY) {

                if (!args[0]) return;

                let name = args[0];
                let _url;
                let voiceChannel;

                ds.fetchAudio(serverid, name).then(url => {
                    if (url) {
                        _url = url;
                        voiceChannel = msg.member.voiceChannel;
                        return voiceChannel.join();
                    } else {
                        reject()
                    }
                }).then(connection => {
                    let dispatcher = connection.playArbitraryInput(_url)
                    dispatcher.on('end', () => {
                        voiceChannel.leave();
                        msg.delete();
                    })
                    dispatcher.on('error', (err) => {
                        console.log(err);
                    })
                }).catch(err => {
                    console.log(err);
                })

            }

            if (option == COMMANDS.AUDIO.OPTIONS.ADD) {

                if (!args[0]) return;
                if (msg.attachments.size < 1) { 
                    msg.channel.send("**Couldn't add audio** - Missing mp3 attachment") 
                    return;
                };

                let name = args[0];
                let url = msg.attachments.values().next().value.url;

                if (!url.endsWith('.mp3')) {
                    msg.channel.send("**Couldn't add audio** - file is not a .mp3")
                    return;
                }
                

                (async () => {

                    let response = await ds.addAudio(serverid, name, url);
                    
                    if (response && response.modifiedCount > 0) {
                        msg.channel.send(`Audio added *${name}*`)
                    }

                })();
            }

            if (option == COMMANDS.AUDIO.OPTIONS.DELETE) {

                if (!args[0]) return;

                let name = args[0];

                (async () => {

                    let response = await ds.deleteAudio(serverid, name);

                    if (response && response.modifiedCount > 0) {
                        msg.channel.send(`Audio deleted *${name}*`)
                    }

                })();
                
            }

            if (option == COMMANDS.AUDIO.OPTIONS.LIST) {
                ds.listAudio(serverid).then(audio => {
                    let str = '**Available audio** - [';
                    audio.forEach((x, index) => {
                        if (index == audio.length - 1) {
                            str += x.name;
                        } else {
                            str += x.name + ', ';
                        }
                    })
                    str += ']'
                    msg.channel.send(str);
                }).catch(err => {
                    console.log(err);
                })
            }
        }

        if (command == COMMANDS.HELP.NAME) { 
            msg.channel.send('**Commands** - `!audio list`, `!audio play [name]`, `!audio add [name]`, `!audio delete [name]`')
        }
    }
    
}