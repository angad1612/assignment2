module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/updateUser", async function(req, res){
        if (!req.body || !req.body.user || !req.body.userName || !req.body.updateData){
            return res.sendStatus(400);
        }

        let isGroupAdmin = await checkUserAuthorised("groupAdmin", req.body.user);
        let isSuperAdmin = await checkUserAuthorised("superAdmin", req.body.user);
        // ONLY LET USER UPDATE PROCESS IF ITS FROM THE USER ITSELF
        if (req.body.user != req.body.userName && !isGroupAdmin && !(typeof req.body.updateData.role != "undefined" && isSuperAdmin)){
            return res.sendStatus(401);
        }
        
        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");

            // CHECK IF USER EXISTS
            collection.find({"name": req.body.userName}).count((err, count) => {
                if (count == 1){

                    // UPDATE USER
                    collection.updateOne({"name": req.body.userName}, {"$set": req.body.updateData}, (err, dbres) => {
                        if (err) {throw err;}
                        res.send({});
                        client.close();
                    });
                } else{
                    res.sendStatus(409);
                    client.close();
                }
            });
        });
    });
}
