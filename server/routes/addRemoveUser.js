module.exports = function(app, dbData, checkUserAuthorised, placeholderProfilePic){
    app.post("/addRemoveUser", async function(req, res){
        if (!req.body || !req.body.user || !req.body.userData || !req.body.userData.name){
            return res.sendStatus(400);
        }

        let isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
        if (!isAuthorised){
            return res.sendStatus(401);
        }

        //CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");

            if (req.body.remove){

                 // REMOVE USER
                collection.find({"name": req.body.userData.name}).count((err, count) => {
                    if (count == 1){
                        collection.deleteOne({"name": req.body.userData.name}, (err, dbres) => {
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
                if (!req.body.userData.email || !req.body.userData.role){
                    client.close();
                    return res.sendStatus(400);
                }
                // CREATE DATA FOR NEW USER
                let newUser = req.body.userData;
                newUser.password = newUser.password || "";
                newUser.groupAssisFor = newUser.groupAssisFor || [];                
                newUser.profilePic = newUser.profilePic || placeholderProfilePic;

                // ADD USER
                collection.find({"name": req.body.userData.name}).count((err, count) => {
                    if (count == 0){
                        collection.insertOne(newUser, (err, dbres) => {
                            if (err) {throw err;}
                            res.send({"success": true});
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
