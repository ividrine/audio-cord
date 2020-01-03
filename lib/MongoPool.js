let uri = process.env.MONGO_URI;
if (!uri) throw "Missing mongodb URI";
let mongodb = require('mongodb');
let Client = mongodb.MongoClient;
let _db;
module.exports = {
    db: () => {
        return _db;
    },
    connect: () => {
        return new Promise((resolve, reject) => {
            Client.connect(uri, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    _db = client.db();
                    resolve(_db)
                }
            })
        })
    }
}