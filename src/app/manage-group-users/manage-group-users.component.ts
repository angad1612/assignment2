import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-manage-group-users',
  templateUrl: './manage-group-users.component.html',
  styleUrls: ['./manage-group-users.component.css']
})
export class ManageGroupUsersComponent implements OnInit {
  // To allow the html to access these functions
  Object: any = Object;
  // The name of the group
  group: string = "";
  users: any = {};
  isGroupAdmin: boolean = false;
  isGroupAssis: boolean = false;

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    this.group = this.route.snapshot.params['group'];
    this.isGroupAdmin = (await this.dataService.checkUserAuthorised("groupAdmin")).authorised;
    this.isGroupAssis =  (await this.dataService.checkUserAuthorised("groupAssis", this.group)).authorised;
    this.refreshData();
  }

  // Refresh the page data
  async refreshData(){
    this.users = await this.dataService.getAuthorisedGroupChannelUsers(this.group);
    await (new Promise(resolve => setTimeout(resolve, 1)));
    // Lambda function for counting how many channels are authorised or not
    let countAuthorisedChannels = (user: string, authState: boolean) => {
      let count = 0;
      for (let channel in this.users[user].channels){
        if (this.users[user].channels[channel] == authState){
          count++;
        }
      }
      return count;
    }
    for (let user in this.users){
      // Disable the group assis add/remove button if the user isn't a member of the group
      let element: any = document.getElementById("groupAssis"+user);
      if (element){
        element.disabled = !this.users[user].authorised;
      }

      // Disable the add channel to button if the user isn't a member of the group
      element = document.getElementById("channelAdd"+user);
      if (element){
        element.disabled = !this.users[user].authorised || (countAuthorisedChannels(user, false) < 1);
      }

      // Disable the remove from channel button if the user isn't a member of the group
      element = document.getElementById("channelRemove"+user);
      if (element){
        element.disabled = !this.users[user].authorised || (countAuthorisedChannels(user, true) < 1);
      }

      // Disable the remove from group button if the the user is a group assis
      element = document.getElementById("groupRemove"+user);
      if (element){
        element.disabled = this.users[user].groupAssis;
      }
    }
  }

  // Display the drop down menu of the button when clicked
  toggleDropdown(dropdown: string, user: string){
    // Show the clicked on dropdown menu
    let element: any = document.getElementById(dropdown+"Dropdown"+user);
    element.classList.toggle("show");

    // Loop through the users and disable the other users dropdowns of the same type (if open)
    for (let otherUser in this.users){
      if (otherUser != user){
        element = document.getElementById(dropdown+"Dropdown"+otherUser);
        if (element.classList.contains("show")){
          element.classList.remove("show");
        }
      }
    }
  }

  // Add or remove a user from a group or channel
  async addRemoveGroupChannelUser(userName: string, remove: boolean, channel: string | null = null){
    await this.dataService.addRemoveGroupChannelUser(userName, remove, this.group, channel);
    this.refreshData();
  }

  // Add or remove a group assis
  async addRemoveGroupAssis(userName: string, remove: boolean){
    await this.dataService.addRemoveGroupAssis(userName, remove, this.group);
    this.refreshData();
  }

  // Check for mouse clicks
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    let target: any = event.target;
    if (!target.matches("input")){
      // Loop through the users and disable the dropdowns for them if the mouse is not clicked on a button
    for (let user in this.users){
        let element: any = document.getElementById("addDropdown"+user);
        if (element.classList.contains("show")){
          element.classList.remove("show");
        }
        element= document.getElementById("removeDropdown"+user);
        if (element.classList.contains("show")){
          element.classList.remove("show");
        }
      }
    }
  }
}
