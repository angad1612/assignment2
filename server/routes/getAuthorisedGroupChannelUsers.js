module.exports = function(app, dbData, checkUserAuthorised, sortObject){
    app.post("/getAuthorisedGroupChannelUsers", async function(req, res){
        if (!req.body || !req.body.user || !req.body.groupName){
            return res.sendStatus(400);
        }

        // CHECK IF USER IS AUTHORISED TO RETRIEVE USERS FOR GROUPS AND CHANNELS
        let isAuthorised = await checkUserAuthorised("groupAssis", req.body.user, req.body.groupName);
        if (!isAuthorised){
            return res.sendStatus(401);
        }
        // CHECK IF USER IS AUTHORISED TO SEE ALL MEMBERS
        let isGroupAdmin = await checkUserAuthorised("groupAdmin", req.body.user);

        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let groupCollection = db.collection("groups");
            let userCollection = db.collection("users");

            let authorisedUsers = {};
            userCollection.find({}).toArray(async (err, users) => {
                let dbFinished = 0;

                // LOOP THROUGH EACH USER TO CHECK IF THEY ARE AUTHORISED
                for (let user of users){
                    let userAuthorisedGroup = false;
                    groupCollection.find({"name": req.body.groupName}).toArray(async (err, group) => {

                        // CHECK IF GROUP NAME DOESNT EXIST
                        if (!group[0]){
                            client.close();
                            return res.sendStatus(400);
                        }

                        // LOOP THROUGH IF AUTHORISED USERS OF GROUP MATCHES THE CURRENT USER
                        for (groupUser of group[0].users){
                            if (user.name == groupUser){
                                userAuthorisedGroup = true;
                                break;
                            }
                        }
                        // ADD USER TO AUTHORISED USERS IF THEY ARE AUTHORISED OR IS REQUESTED BY GROUP ADMIN
                        if (isGroupAdmin){
                            let isUserGroupAssis = await checkUserAuthorised("groupAssisExclusive", user.name, req.body.groupName);
                            authorisedUsers[user.name] = {"authorised" : userAuthorisedGroup, "groupAssis": isUserGroupAssis, "channels" : {}};
                        } else if (userAuthorisedGroup){
                            authorisedUsers[user.name] = {"authorised" : true, "channels" : {}};
                        } else {
                            dbFinished++;
                            return;
                        }

                        // LOOP THROUGH CHANNELS IF USER IS AUTHORISED
                        for (channel of Object.keys(group[0].channels)){
                            let userAuthorisedChannel = false;

                            // LOOP THROUGH AUTHORISED USERS OF THE GROUP
                            for (groupUser of group[0].channels[channel].users){
                                if (user.name == groupUser){
                                    userAuthorisedChannel = true;
                                    break;
                                }
                            }
                            authorisedUsers[user.name].channels[channel] = userAuthorisedChannel;
                        }

                        dbFinished++;
                    });
                }

                // LET DB FINISH PROCESSING ALL USERS
                while (dbFinished < users.length){
                    await (new Promise(resolve => setTimeout(resolve, 1)));
                }

                res.send(sortObject(authorisedUsers));
                client.close();
            });
        });
    });
}
