import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor( private backendService: BackendService ) { }

  // Attmept to log in the suer
  async login(loginDetails: object){
    return await this.backendService.post("/login", loginDetails)
  }

  // Check if the user meets the supplied minimum authorisation
  async checkUserAuthorised(minRole: string, group: string | null = null, user: string | null = localStorage.getItem("currentUser")){
    return await this.backendService.post("/checkUserAuthorised", {"minRole": minRole, "groupName": group, "user": user})
  }

  // Get the channels in the groups the user is authorised to see
  async getAuthorisedGroupChannels(){
    return await this.backendService.post("/getAuthorisedChannels", {"user": localStorage.getItem("currentUser")});
  }

  // Delete the specified channel or group
  async deleteGroupChannel(group: string, channel: string | null = null){
    return await this.backendService.post("/deleteGroupChannel", {"groupName": group, "channelName": channel, "user": localStorage.getItem("currentUser")});
  }

  // Create a new channel or group
  async createGroupChannel(group: string, channel: string | null){
    return await this.backendService.post("/createGroupChannel", {"groupName": group, "channelName": channel, "user": localStorage.getItem("currentUser")});
  }

  // Get a list of users that says wether they are authorised to access the group and its channels
  async getAuthorisedGroupChannelUsers(group: string){
    return await this.backendService.post("/getAuthorisedGroupChannelUsers", {"groupName": group, "user": localStorage.getItem("currentUser")});
  }

  // Add or remove a user from a group or channel
  async addRemoveGroupChannelUser(userName: string, remove: boolean, group: string, channel: string | null = null){
    return await this.backendService.post("/addRemoveGroupChannelUser", {"groupName": group, "channelName": channel, "userName": userName, "remove": remove, "user": localStorage.getItem("currentUser")});
  }

  // Add or remove a user as a group assistant
  async addRemoveGroupAssis(userName: string, remove: boolean, groupName: string){
    return await this.backendService.post("/addRemoveGroupAssis", {"groupName": groupName, "userName": userName, "remove": remove, "user": localStorage.getItem("currentUser")});
  }

  // Get the users
  async getUsers(){
    return await this.backendService.post("/getUsers", {"user": localStorage.getItem("currentUser")});
  }

  // Update a user
  async updateUser(userName: string, updateData: any){
    return await this.backendService.post("/updateUser", {"userName": userName, "updateData": updateData, "user": localStorage.getItem("currentUser")});
  }

  // Add or remove a user
  async addRemoveUser(userData: any, remove: boolean){
    return await this.backendService.post("/addRemoveUser", {"userData": userData, "remove": remove, "user": localStorage.getItem("currentUser")});
  }

  // Get the data for the current user
  async getUserData(){
    return await this.backendService.post("/getUserData", {"user": localStorage.getItem("currentUser")});
  }

  // Get chat for the specified channel
  async getChat(group: string, channel: string){
    return await this.backendService.post("/getChat", {"groupName": group, "channelName": channel, "user": localStorage.getItem("currentUser")});
  }

  // Get the profile pictures of all the users
  async getProfilePics(){
    return await this.backendService.post("/getProfilePics", {});
  }
}
