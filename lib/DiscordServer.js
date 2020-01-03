class DiscordServer {
    
    constructor(db) {this.db = db; }

    fetchAudio(_serverId, _name) {
        return new Promise((resolve, reject) => {
            this.db.collection('discordserver').aggregate([
                {$match: {serverId: _serverId}},
                {$unwind: '$audio'},
                {$match: {"audio.name": _name}},
                {$project: {"audio.url": 1, _id: 0}}
            ]).toArray((err, arr) => {
                if (err) reject(err);
                else if (!arr[0] || !arr[0].audio || !arr[0].audio.url) resolve(null);
                else resolve(arr[0].audio.url);
            })
        })
    }

    addAudio(_serverId, _name, _url) {
        return this.db.collection('discordserver').updateOne(
            {serverId: _serverId},
            {$addToSet: {audio: {name: _name, url: _url}}}
        )
    }

    deleteAudio(_serverId, _name) {
        return this.db.collection('discordserver').updateOne(
            {serverId: _serverId},
            {$pull: {audio: {name: _name}}}
        )
    }

    listAudio(serverid) {
        return new Promise((resolve, reject) => {
            this.db.collection('discordserver').findOne({serverId: serverid}).then(doc => {
                if (doc && doc.audio) {
                    resolve(doc.audio)
                } else {
                    resolve(null);
                }
            }).catch(err => {
                reject(err);
            })
        })
    }

    addServer(_serverId, _name) {
        return this.db.collection('discordserver').updateOne(
            {serverId: _serverId}, 
            {$set: {serverId: _serverId, name: _name}}, 
            {upsert: true}
        )
    }

    ready() {
        if (this.db) return true;
        else return false;
    }
    
}

module.exports = DiscordServer;