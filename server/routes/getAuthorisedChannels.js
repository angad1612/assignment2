module.exports = function(app, dbData, checkUserAuthorised){
    app.post("/getAuthorisedChannels", async function(req, res){
        if (!req.body || !req.body.user){
            return res.sendStatus(400);
        }

        // CONNECT TO DATABASE
        dbData.MongoClient.connect(dbData.url, async function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("groups");
            collection.find().toArray(async (err, groups) => {
                let authorisedChannels = {};

                let allGroupsVisible = await checkUserAuthorised("groupAdmin", req.body.user);

                // LOOP THROUGH GROUPS TO CHECK IF THE USER IS AUTHORISED TO ACCESS GROUP
                for (let i in groups){
                    let groupFullyVisible = await checkUserAuthorised("groupAssis", req.body.user, groups[i].name);
                    if (allGroupsVisible || groupFullyVisible){
                        authorisedChannels[groups[i].name] = [];
                    } else{
                        // LOOP THROUGH AUTHORISED USERS TO CHECK IF CURRENT USER IS IN GROUP 
                        for (user of groups[i].users){
                            if (req.body.user == user){
                                authorisedChannels[groups[i].name] = [];
                                break;
                            }
                        }
                    }

                    if (authorisedChannels[groups[i].name]){

                        //LOOP THROUGH CHANNELS OF THE GROUP TO CHECK IF USER IS AUTHORISED TO ACCESS
                        for (let channelName in groups[i].channels){
                            if (groupFullyVisible){
                                authorisedChannels[groups[i].name].push(channelName);
                            } else{

                                // LOOP THROUGH THE AUTHORISED USERS TO CHECK IF CURRENT USER IS IN CHANNEL
                                for (user of groups[i].channels[channelName].users){
                                    if (req.body.user == user){
                                        authorisedChannels[groups[i].name].push(channelName);
                                        break;
                                    }
                                }
                            }
                        }

                        // SORTING OUT CHANNEL BY NAME
                        authorisedChannels[groups[i].name].sort();
                    }
                }

                res.send(sortObject(authorisedChannels));
                client.close();
            });
        });
    });
}
