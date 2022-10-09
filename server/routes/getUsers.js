module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/getUsers", async function(req, res){
        if (!req.body || !req.body.user){
            return res.sendStatus(400);
        }

        let isAuthorised = await checkUserAuthorised("groupAdmin", req.body.user);
        if (!isAuthorised){
            return res.sendStatus(401);
        }
        let isSuperAdmin = await checkUserAuthorised("superAdmin", req.body.user);

        // Connect to the DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");

            collection.find().toArray(async (err, dbUsers) => {
                let users = [];

                // Loop through the suers and only add the necessary data to the users array
                for (let dbUser of dbUsers){
                    let user = {};
                    user.name = dbUser.name;
                    user.email = dbUser.email;
                    // Add the role only if the requesting user is a super admin since only they can change roles
                    if (isSuperAdmin){
                        user.role = dbUser.role;
                    }
                    users.push(user);
                }
                // Sort the users
                users.sort((a, b) =>{
                    if (a.name > b.name) {return 1;}
                    else if (a.name == b.name) {return 0;}
                    else if (a.name < b.name) {return -1;}
                });
                
                res.send(users);
                client.close();
            });
         });
    });
}