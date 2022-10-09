var assert = require("assert");
var server = require("./server.js");
var chai = require("chai");
var chaiHttp = require("chai-http");
var should = chai.should();
chai.use(chaiHttp);

var dbData = {
	"MongoClient": require("mongodb").MongoClient,
	"url": "mongodb://localhost:27017",
	"name": "Assignment2"
}

describe("Server test", async () => {
	let dbContents = {};
	
	before(() => { return new Promise(async (resolve) => {
		dbData.MongoClient.connect(dbData.url, async function(err, client){
			if (err) {throw err;}
			var db = client.db(dbData.name);
            // Reset the groups collection
			var collection = db.collection("groups");
			collection.find({}).toArray((err, data) => {
				dbContents.groups = data;
			});
			collection.deleteMany({});
            // Reset the users collection
            collection = db.collection("users");
			collection.find({}).toArray((err, data) => {
				dbContents.users = data;
			});
			collection.deleteMany({});
			// Insert some users into the database to make testing easier
			let placeholderProfilePic = require("./placeholderProfilePic.js")
			collection.insertMany([
				{"name": "super", "password": "", "email": "super@com.au", "role": "superAdmin", "groupAssisFor": [], "profilePic": placeholderProfilePic},
				{"name": "group", "password": "", "email": "group@com.au", "role": "groupAdmin", "groupAssisFor": [], "profilePic": placeholderProfilePic},
				{"name": "assis", "password": "", "email": "assis@com.au", "role": "none", "groupAssisFor": ["Group 1"], "profilePic": placeholderProfilePic},
				{"name": "user", "password": "", "email": "user@com.au", "role": "none", "groupAssisFor": [], "profilePic": placeholderProfilePic}
			], () => {
				client.close();
			    resolve();
			});
		});
	});});
	
	after(() => {
		dbData.MongoClient.connect(dbData.url, function(err, client){
			if (err) {throw err;}
			var db = client.db(dbData.name);
            // Restore the groups collection
			var collection = db.collection("groups");
			collection.deleteMany({});
			collection.insertMany(dbContents.groups);
            // Restore the users collection
            var collection = db.collection("users");
			collection.deleteMany({});
			collection.insertMany(dbContents.users, () => {
				client.close();
			});
			server.close();
		});
	});

    describe("/login", () => {
		it("Valid username and password", (done) => {
			chai.request(server).post("/login").send({"username": "super", "password": ""}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("user");
				res.body.user.should.be.eql("super");
				done();
			});
		});
		it("Valid username and invalid password", (done) => {
			chai.request(server).post("/login").send({"username": "super", "password": "pass"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.not.have.property("user");
				done();
			});
		});
		it("Invalid username", (done) => {
			chai.request(server).post("/login").send({"username": "Not a user"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.not.have.property("user");
				done();
			});
		});
		it("No username", (done) => {
			chai.request(server).post("/login").send({}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
    });

	describe("/checkUserAuthorised", () => {
		it("Min Role: Super Admin, User Role: Super Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "superAdmin", "user": "super"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Super Admin, User Role: Group Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "superAdmin", "user": "group"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Super Admin, User Role: Group Assistant", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "superAdmin", "user": "assis"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Super Admin, User Role: None", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "superAdmin", "user": "user"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Group Admin, User Role: Super Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAdmin", "user": "super"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Admin, User Role: Group Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAdmin", "user": "group"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Admin, User Role: Group Assistant", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAdmin", "user": "assis"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Group Admin, User Role: None", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAdmin", "user": "user"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Group Assis (Group 1), User Role: Super Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "super", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Assis (Group 1), User Role: Group Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "group", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Assis (Group 1), User Role: Group Assistant", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "assis", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Assis (Group 1), User Role: None", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "user", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Group Assis (Group 2), User Role: Super Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "super", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Assis (Group 2), User Role: Group Admin", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "group", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(true);
				done();
			});
		});
		it("Min Role: Group Assis (Group 2), User Role: Group Assistant", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "assis", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("Min Role: Group Assis (Group 2), User Role: None", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "groupAssis", "user": "user", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("authorised");
				res.body.authorised.should.be.eql(false);
				done();
			});
		});
		it("No supplied user", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"minRole": "superAdmin"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied min role", (done) => {
			chai.request(server).post("/checkUserAuthorised").send({"user": "super"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/addRemoveUser", () => {
		it("Add valid user as a user with an authorised role", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super", "userData": {"name": "New User", "email": "user@com.au", "role": "none"}}).end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("success");
				res.body.success.should.be.eql(true);
				done();
			});
		});
		it("Add valid user as a user with an unauthorised role", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "user", "userData" : {"name": "Another New User", "email": "user@com.au", "role": "none"}}).end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
		it("Add duplicate user", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super", "userData": {"name": "group", "email": "group@com.au", "role": "groupAdmin"}}).end((err, res) => {
				res.should.have.status(409);
				done();
			});
		});
		it("Remove valid user", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super", "userData" : {"name": "New User"}, "remove": true}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Remove non-existant user", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super", "userData" : {"name": "New User"}, "remove": true}).end((err, res) => {
				res.should.have.status(409);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/addRemoveUser").send({"userData": {"name": "validuser2", "email": "validuser2@com.au", "role": "none"}}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied user data", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied username", (done) => {
			chai.request(server).post("/addRemoveUser").send({"user": "super", "userData": {"email": "validuserish@com.au", "role": "none"}}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/createGroupChannel", () => {
		it("Create group", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Create group 2", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Create duplicate group", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(409);
				done();
			});
		});
		it("Create channel", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super", "groupName": "Group 1", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Create channel 2", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super", "groupName": "Group 1", "channelName": "Channel 2"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/createGroupChannel").send({"groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/createGroupChannel").send({"user": "super"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/deleteGroupChannel", () => {
		it("Delete group", (done) => {
			chai.request(server).post("/deleteGroupChannel").send({"user": "super", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Delete channel", (done) => {
			chai.request(server).post("/deleteGroupChannel").send({"user": "super", "groupName": "Group 1", "channelName": "Channel 2"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/deleteGroupChannel").send({"groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/deleteGroupChannel").send({"user": "super"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/addRemoveGroupChannelUser", () => {
		it("Add user to group", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "groupName": "Group 1", "userName": "user"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Add user to channel", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "groupName": "Group 1", "userName": "user", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Delete user from channel", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "groupName": "Group 1", "userName": "user", "channelName": "Channel 1", "remove": true}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Remove user from group", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "groupName": "Group 1", "userName": "user", "remove": true}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"groupName": "Group 2", "userName": "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "userName": "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied username", (done) => {
			chai.request(server).post("/addRemoveGroupChannelUser").send({"user": "super", "groupName": "Group 2"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/addRemoveGroupAssis", () => {
		it("Add group assis", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"user": "super", "groupName": "Group 1", "userName": "user"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Remove group assis", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"user": "super", "groupName": "Group 1", "userName": "user", "remove": true}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"groupName": "Group 1", "username": "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"groupName": "Group 1", "username": "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"user": "super", "username": "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied username", (done) => {
			chai.request(server).post("/addRemoveGroupAssis").send({"user": "super", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getAuthorisedChannels", () => {
		it("Get authorised channels", (done) => {
			chai.request(server).post("/getAuthorisedChannels").send({"user": "user"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/getAuthorisedChannels").send({}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getAuthorisedGroupChannelUsers", () => {
		it("Get authorised group users", (done) => {
			chai.request(server).post("/getAuthorisedGroupChannelUsers").send({"user": "super", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("Get authorised channel users", (done) => {
			chai.request(server).post("/getAuthorisedGroupChannelUsers").send({"user": "super", "groupName": "Group 1", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/getAuthorisedGroupChannelUsers").send({"groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/getAuthorisedGroupChannelUsers").send({"user": "super"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getUsers", () => {
		it("Get users", (done) => {
			chai.request(server).post("/getUsers").send({"user": "super"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/getUsers").send({}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getUserData", () => {
		it("Get user data", (done) => {
			chai.request(server).post("/getUserData").send({"user": "user"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/getUserData").send({}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/updateUser", () => {
		it("Update user", (done) => {
			chai.request(server).post("/updateUser").send({"user": "user", "userName" : "user", "updateData": {"email": "user2@com.au"}}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/updateUser").send({"userName" : "user", "updateData": {"email": "user2@com.au"}}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied username", (done) => {
			chai.request(server).post("/updateUser").send({"user": "user", "updateData": {"email": "user2@com.au"}}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied user update data", (done) => {
			chai.request(server).post("/updateUser").send({"user": "user", "userName" : "user"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getChat", () => {
		it ("Get chat", (done) => {
			chai.request(server).post("/getChat").send({"user": "super", "groupName": "Group 1", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
		it("No supplied requesting user", (done) => {
			chai.request(server).post("/getChat").send({"groupName": "Group 1", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied group name", (done) => {
			chai.request(server).post("/getChat").send({"user": "super", "channelName": "Channel 1"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
		it("No supplied channel name", (done) => {
			chai.request(server).post("/getChat").send({"user": "super", "groupName": "Group 1"}).end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});

	describe("/getProfilePics", () => {
		it("Get profile pics", (done) => {
			chai.request(server).post("/getProfilePics").send({}).end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
	});
});
