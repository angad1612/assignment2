module.exports = function(app, dbData, checkUserAuthorised, io, userRoomConnections){
    io.on("connection", (socket) => {

        //HANDLE THE USER JOINING CHANNEL
        socket.on("join", async (groupName, channelName, user) =>{
            if (!groupName || !channelName || !user){

                // TERMINATE THE CONNECTION DUE TO INVLAID DATA BEING SENT
                socket.disconnect();
                return;
            }
            let isGroupAdmin = await checkUserAuthorised("groupAdmin", user);
            let isGroupAssis = await checkUserAuthorised("groupAssis", groupName);

            // CONNECT TO DB
            dbData.MongoClient.connect(dbData.url, async function(err, client){
                if (err) {throw err;}
                let db = client.db(dbData.name);
                let collection = db.collection("groups");
    
                collection.find({"name": groupName}).toArray((err, group) => {
                    if (!group[0] || !group[0].channels[channelName]){

                        // TERMINATE CONNECTION IF GROUP OR CHANNEL DOESNT EXIST
                        socket.disconnect();
                        return;
                    }

                    // CHECK IF USER CAN ACCESS THE GROUP
                    if (!group[0].users.find((user) => {return user == user;}) && !isGroupAdmin){
                        socket.disconnect();
                        return;
                    }
                    // CHECK IF THE USER CAN ACCESS THE CHANNEL
                    if (!group[0].channels[channelName].users.find((user) => {return user == user;}) && !isGroupAssis){
                        socket.disconnect();
                        return;
                    }

                    // CONNECT THE USER SOCKET TO THE ROOM
                    let room = groupName+"\n"+channelName;
                    socket.join(room);
                    userRoomConnections[socket.id] = room;
                });
            });
        });

        // USER DISCONNECTS
        socket.on("disconnect", () => {
            delete userRoomConnections[socket.id];
        });

        // USER SENDING A MESSAGE
        socket.on("message", (messageData) => {
            if (!messageData.user){
                socket.disconnect();
                return;
            }
            let room = userRoomConnections[socket.id]
            let groupChannel = room.split("\n");

             // CONNECT TO DB
            dbData.MongoClient.connect(dbData.url, async function(err, client){
                if (err) {throw err;}
                let db = client.db(dbData.name);
                let collection = db.collection("groups");
    
                // CHECKING IF CHANNEL EXISTS
                collection.find({"name": groupChannel[0], ["channels."+groupChannel[1]]: {"$exists" : true}}).count((err, count) => {
                    if (count == 1){

                        // ADD MESSAGE TO CHANNEL WHICH THE USER IS CONNECTED TO
                        collection.updateOne({"name": groupChannel[0]}, {"$push": {["channels."+groupChannel[1]+".chat"]: messageData}}, (err, dbres) => {
                            if (err) {throw err;}
                            client.close();
                        });
                    } else{

                        // TERMINATE CONNECTION SINCE IT TRIED TO SEND A MESSAGE TO A CHANNEL THAT NO LONGER EXISTS (IF CHANNEL GETS REMOVED)
                        socket.disconnect();
                        return;
                    }
                });
            });

            // SEND MESSAGE TO THE OTHER USER CURRENTLY IN THE SAME ROOM
            io.to(room).emit("message", messageData);
        });
    });
}
