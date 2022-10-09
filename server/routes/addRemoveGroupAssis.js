module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/addRemoveGroupAssis", async function(req, res){
        if (!req.body || !req.body.user || !req.body.userName || !req.body.groupName){
            return res.sendStatus(400);
        }

        let isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
        if (!isAuthorised){
            return res.sendStatus(401);
        }

        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");

            if (req.body.remove){
                // RREMOVE USER FROM BEING A GROUP ASSISTANT
                collection.find({"name": req.body.userName, "groupAssisFor": {"$eq": req.body.groupName}}).count((err, count) => {
                    if (count == 1){
                        collection.updateOne({"name": req.body.userName}, {"$pull": {"groupAssisFor": req.body.groupName}}, (err, dbres) => {
                            if (err) {throw err;}
                            res.send({});
                            client.close();
                        });
                    } else{
                        res.sendStatus(409);
                        client.close();
                    }
                });
            } else {
                // ADD USER AS A GROUP ASSISTANT
                collection.find({"name": req.body.userName, "groupAssisFor": {"$eq": req.body.groupName}}).count((err, count) => {
                    if (count == 0){
                        collection.updateOne({"name": req.body.userName}, {"$push": {"groupAssisFor": req.body.groupName}}, (err, dbres) => {
                            if (err) {throw err;}
                            res.send({});
                            client.close();
                        });
                    } else{
                        res.sendStatus(409);
                        client.close();
                    }
                });
            }
        });
    });
}
