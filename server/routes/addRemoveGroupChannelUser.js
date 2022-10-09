module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/addRemoveGroupChannelUser", async function(req, res){
        if (!req.body || !req.body.user || !req.body.userName || !req.body.groupName){
            return res.sendStatus(400);
        }

        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("groups");

            
            if (req.body.channelName){

                // CHECK IF USE IS AUTHORISED
                let isAuthorised = await checkUserAuthorised("groupAssis", req.body.user, req.body.groupName);
                if (!isAuthorised){
                    client.close();
                    return res.sendStatus(401);
                }
                if (req.body.remove){

                    // REMOVE USER FROM THE CHANNEL
                    collection.find({"name": req.body.groupName, ["channels."+req.body.channelName+".users"]: {"$eq": req.body.userName}}).count((err, count) => {
                        if (count == 1){
                            collection.updateOne({"name": req.body.groupName}, {"$pull": {["channels."+req.body.channelName+".users"]: req.body.userName}}, (err, dbres) => {
                                if (err) {throw err;}
                                res.send({});
                                client.close();
                            });
                        } else{
                            res.sendStatus(409);
                        }
                    });
                } else{

                    // ADD USER TO A CREATED CHANNEL
                    collection.find({"name": req.body.groupName, ["channels."+req.body.channelName+".users"]: {"$eq": req.body.userName}}).count((err, count) => {
                        if (count == 0){
                            collection.updateOne({"name": req.body.groupName}, {"$push": {["channels."+req.body.channelName+".users"]: req.body.userName}}, (err, dbres) => {
                                if (err) {throw err;}
                                res.send({});
                                client.close();
                            });
                        } else{
                            res.sendStatus(409);
                        }
                    });
                }
            } else{

                // CHECK IF USER IS AUTHORISED
                let isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
                if (!isAuthorised){
                    return res.sendStatus(401);
                }
                if (req.body.remove){
                    // REMOVE USER FROM THE GROUP
                    collection.find({"name": req.body.groupName, "users": {"$eq": req.body.userName}}).count((err, count) => {
                        if (count == 1){
                            collection.updateOne({"name": req.body.groupName}, {"$pull": {"users": req.body.userName}}, (err, dbres) => {
                                if (err) {throw err;}
                                res.send({});
                                client.close();
                            });
                        } else{
                            res.sendStatus(409);
                        }
                    });
                } else{
                    // ADD USER TO GROUP
                    collection.find({"name": req.body.groupName, "users": {"$eq": req.body.userName}}).count((err, count) => {
                        if (count == 0){
                            collection.updateOne({"name": req.body.groupName}, {"$push": {"users": req.body.userName}}, (err, dbres) => {
                                if (err) {throw err;}
                                res.send({});
                                client.close();
                            });
                        } else{
                            res.sendStatus(409);
                        }
                    });
                }
            }
        });
    });
}
