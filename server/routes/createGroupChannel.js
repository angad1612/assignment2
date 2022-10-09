module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/createGroupChannel", async function(req, res){
        if (!req.body || !req.body.user || !req.body.groupName){
            return res.sendStatus(400);
        }

        // CHECK IS USER IS AUTHORISED TO DELETE GROUP AND/OR CHANNEL
        let isAuthorised = false;

        // IF A CHANNEL IS BEING CREATED, CHECK IF USER IS A GROUP ASSISTANT, ELSE CHECK IF THEY ARE A GROUP ADMIN
        if (req.body.channelName){
            isAuthorised = await checkUserAuthorised("groupAssis", req.body.user, req.body.groupName);
        } else {
            isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
        }
        if (!isAuthorised){
            return res.sendStatus(401);
        }

        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("groups");

            // CREATE CHANNEL IF FOUNDED, OTHERWISE CREATE GROUP
            if (req.body.channelName){

                  // CHECK IF CHANNEL EXISTS 
                collection.find({"name": req.body.groupName, ["channels."+req.body.channelName]: {"$exists" : true}}).count((err, count) => {
                    if (count == 0){

                        // CREATE A NEW CHANNEL
                        collection.updateOne({"name": req.body.groupName}, [{"$set": {["channels."+req.body.channelName]: {"users" : [], "chat" : []}}}], (err, dbres) => {
                            if (err) {throw err;}
                            client.close();
                            res.send({});
                        });
                    } else{
                        client.close();
                        res.sendStatus(409);
                    }
                });
            } else {
                // CHECK IF A GROUP DOESNT HAVE AN EXISTING NAME ALREADY
                collection.find({"name": req.body.groupName}).count((err, count) => {
                    if (count == 0){
                        // Create the new group
                        collection.insertOne({"name": req.body.groupName, "users": [], "channels": {}}, (err, dbres) => {
                            if (err) {throw err;}
                            client.close();
                            res.send({});
                        });
                    } else{
                        client.close();
                        res.sendStatus(409);
                    }
                });
            }
        });
    });
}
