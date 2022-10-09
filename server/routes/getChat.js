module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/getChat", async function(req, res){
        if (!req.body || !req.body.user || !req.body.groupName || !req.body.channelName){
            return res.sendStatus(400);
        }

        let isGroupAdmin = await checkUserAuthorised("groupAdmin", req.body.user);
        let isGroupAssis = await checkUserAuthorised("groupAssis", req.body.user, req.body.groupName);
 
        // Connect to the DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("groups");

            collection.find({"name": req.body.groupName}).toArray((err, group) => {
                if (!group[0] || !group[0].channels[req.body.channelName]){
                    client.close();
                    return res.sendStatus(409);
                }

                // CHECK IF USER CAN ACCESS GROUP
                if (!group[0].users.find((user) => {return user == req.body.user;}) && !isGroupAdmin){
                    client.close();
                    return res.sendStatus(403);
                }
                // CHECK IF USER CAN ACCESS CHANNEL
                if (!group[0].channels[req.body.channelName].users.find((user) => {return user == req.body.user;}) && !isGroupAssis){
                    client.close();
                    return res.sendStatus(403);
                }

                res.send(group[0].channels[req.body.channelName].chat);
                client.close();
            });
        });
    });
}
