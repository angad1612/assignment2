module.exports = function(app, dbData){
    app.post("/getProfilePics", async function(req, res){
        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");

            // RETRIEVING DATA FOR ALL USER
            collection.find().toArray((err, users) => {
                let profilePics = {};
                for (let user of users){
                    profilePics[user.name] = user.profilePic;
                }
                res.send(profilePics);
                client.close();
            });
        });
    });
}
