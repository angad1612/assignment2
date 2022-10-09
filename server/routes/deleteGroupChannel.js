module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/deleteGroupChannel", async function(req, res){
        if (!req.body || !req.body.user || !req.body.groupName){
            return res.sendStatus(400);
        }

        // CHECK IF LOGGED IN USER IS AUTHORISED TO DELETE THE GROUP OR CHANNEL
        let isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
        if (!isAuthorised){
            return res.sendStatus(401);
        }

        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("groups");

            // REMOVE CHANNEL IF IT CREATED
            if (req.body.channelName){
                await collection.updateOne({"name": req.body.groupName}, [{"$unset": "channels."+req.body.channelName}]);
            } else {
                await collection.deleteOne({"name": req.body.groupName});
            }

            res.send({});
        });
    });
}
