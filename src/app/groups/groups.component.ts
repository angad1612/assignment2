import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  // To allow the html to access these functions
  Object: any = Object;
  document: any = document;
  // Variables for handling the users role
  isSuperAdmin: boolean = false;
  isGroupAdmin: boolean = false;
  isGroupAssis: any = {};
  // Variable for the authorised channels in the authorised groups
  authorisedChannels: any = {};

  constructor(private router: Router, private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    this.authorisedChannels = await this.dataService.getAuthorisedGroupChannels();
    this.isSuperAdmin = (await this.dataService.checkUserAuthorised("superAdmin")).authorised;
    this.isGroupAdmin = (await this.dataService.checkUserAuthorised("groupAdmin")).authorised;
    for (let group in this.authorisedChannels){
      this.isGroupAssis[group] = (await this.dataService.checkUserAuthorised("groupAssis", group)).authorised;
    }
  }

  // Function for deleting a group or channel
  async delete(group: string, channel: string | null = null): Promise<void> {
    let confirmationString: string = "";
    // Create the confirmation string based on whether a group or channel is being deleted
    if (channel){
      confirmationString = "Are you sure you want to delete the channel " + channel + " in the group " + group;
    } else {
      confirmationString = "Are you sure you want to delete the group " + group;
    }
    // Get confimation from the user
    if (confirm(confirmationString)){
      await this.dataService.deleteGroupChannel(group, channel);
      // Reset the channel list
      this.authorisedChannels = await this.dataService.getAuthorisedGroupChannels();
    }
  }

  async add(group: string, channelInputId: string | null = null){
    let channel: string | null = null;
    let element: any = undefined;
    // Ge the name of the channel from the channel input if the id was supplied
    if (channelInputId){
      element = document.getElementById(channelInputId);
      channel = element.value;
    } else{
      element = document.getElementById("newGroupInput");
    }
    await this.dataService.createGroupChannel(group, channel);
    // Reset the text box for the added group or channel
    element.value = "";
    // Reset the channel list
    this.authorisedChannels = await this.dataService.getAuthorisedGroupChannels();
  }

  // Connect to the specified channel
  connectToChannel(group: string, channel: string){
    this.router.navigateByUrl("/chat/"+group+"/"+channel);
  }
}
