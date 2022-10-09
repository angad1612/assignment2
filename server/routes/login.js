module.exports = function(app, dbData){
    app.post("/login", function(req, res){
        if (!req.body || !req.body.username){
            return res.sendStatus(400);
        }

        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");
            // CHECK IF A USER WITH THE SUPPLIED NAME AND PASSWORD EXISTS
            collection.find({"name": req.body.username, "password": req.body.password}).count((err, count) => {
                if (count == 1){
                    res.send({"user": req.body.username});
                } else {
                    res.send({});
                }
                client.close();
            });
        });
    });
}
