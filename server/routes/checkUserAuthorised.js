module.exports = function(app, dbData){
    // THIS FUNCTION IS USED FOR GETTING THE USER ROLE
    let checkUserAuthorised = async (minRole, username, group = null) => {
        let retVal = undefined;
        
        // CONNECT TO DB
        dbData.MongoClient.connect(dbData.url, function(err, client){
            if (err) {throw err;}
            let db = client.db(dbData.name);
            let collection = db.collection("users");
            collection.find({"name": username}).toArray((err, user) => {

                // CHECK IF USER DOESNT EXIST
                if (!user[0]){
                    client.close();
                    retVal = false;
                    return;
                }

                // FUNCTION FOR CHECKING IF USER IS A GROUP ASSISTANT OF THE GROUP
                let checkGroupAssis = () => {
                    for (let groupAssisOf of (user[0].groupAssisFor)){
                        if (group == groupAssisOf){
                            return true;
                        }
                    }
                    return false;
                }
                // CHECK IF USER MEETS THE MINIMUM ROLE REQUIREMENT
                if (minRole == "superAdmin" && user[0].role == "superAdmin"){
                    retVal = true;
                } else if (minRole == "groupAdmin" && (user[0].role == "superAdmin" || user[0].role == "groupAdmin")){
                    retVal = true;
                } else if (group && minRole == "groupAssis" && (user[0].role == "superAdmin" || user[0].role == "groupAdmin" || checkGroupAssis())){
                    retVal = true;
                } else if (group && minRole == "groupAssisExclusive" && checkGroupAssis()){
                    retVal = true;
                }else {
                    retVal = false;
                }

                client.close();
            });
        });
        // WAIT FOR THE RETVAL TO BE OBTAINED FROM THE DB
        while (retVal == undefined){
            await (new Promise(resolve => setTimeout(resolve, 1)));
        }
        return retVal;
    }

    app.post("/checkUserAuthorised", async function(req, res){
        if (!req.body || !req.body.minRole || !req.body.user){
            res.sendStatus(400);
        }

        // GET WHETHER THE USER IS AUTHORISED
        let authorised = await checkUserAuthorised(req.body.minRole, req.body.user, req.body.groupName);

        res.send({"authorised" : authorised});
    });

    return checkUserAuthorised;
}
