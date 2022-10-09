import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  isGroupAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  newUserData: any = {
    "name": "",
    "email": "",
    "role": "none"
  }

  constructor(private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    this.isGroupAdmin = (await this.dataService.checkUserAuthorised("groupAdmin")).authorised;
    this.isSuperAdmin = (await this.dataService.checkUserAuthorised("superAdmin")).authorised;
    this.refeshData();
  }

  async refeshData(){
    this.users = await this.dataService.getUsers();
    // Remove the current user since some of the modifications could cause issues
    let currentUser: string | null = localStorage.getItem("currentUser");
    for (let i in this.users){
      if (this.users[i].name == currentUser){
        this.users.splice(parseInt(i), 1);
      }
    }
  }

  // Display the drop down menu of the button when clicked
  toggleDropdown(user: any | null = null){
    // Show the clicked on dropdown menu
    let element: any = undefined;
    if (user){
      let roles = ["superAdmin", "groupAdmin", "none"];
      for (let role of roles){
        element = document.getElementById("Select"+role+user.name);
        element.disabled = role == user.role;
      }
      element = document.getElementById("roleDropdown"+user.name);
    } else{
      let roles = ["groupAdmin", "none"];
      for (let role of roles){
        element = document.getElementById("newUserSelect"+role);
        element.disabled = role == this.newUserData.role;
      }
      element = document.getElementById("newUserRoleDropdown");
      // To fix errors later
      user = {};
    }
    element.classList.toggle("show");

    // Loop through the users and disable the other users dropdowns of the same type (if open)
    for (let otherUser of this.users){
      if (otherUser.name != user.name){
        element = document.getElementById("roleDropdown"+otherUser.name);
        if (element.classList.contains("show")){
          element.classList.remove("show");
        }
      }
    }
    // Hide the new user role dropdown if a user one was just opened
    if (user.name){
      element = document.getElementById("newUserRoleDropdown");
      if (element.classList.contains("show")){
        element.classList.remove("show");
      }
    }
  }

  // Update the users role
  async updateRole(role: string, user: string | null = null){
    // Handle the new users role being changed
    if (!user){
      this.newUserData.role = role;
      // Refresh the drop down
      let roles = ["groupAdmin", "none"];
      for (let role of roles){
        let element: any = document.getElementById("newUserSelect"+role);
        element.disabled = role == this.newUserData.role;
      }
    } else {
      this.dataService.updateUser(user, {"role": role});
      // Refresh the user data
      await this.refeshData();
      await (new Promise(resolve => setTimeout(resolve, 1)));
      // Reopen the drop down since refresing the user data closes it
      this.toggleDropdown({"name": user, "role": role});
    }
  }

  // Add or remove a user
  async addRemoveUser(user: string | null = null){
    if (user){
      // Delete the user if it's supplied
      await this.dataService.addRemoveUser({"name": user}, true);
    } else{
      if (this.newUserData.name && this.newUserData.email){
        let retVal: any = await this.dataService.addRemoveUser(this.newUserData, false);
        if (retVal.success){
          this.newUserData = {
            "name": "",
            "email": "",
            "role": "none"
          }
        }
      }
    }
    this.refeshData();
  }

  // Check for mouse clicks
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    let target: any = event.target;
    if (!target.matches("input")){
      // Loop through the users and disable the dropdowns for them if the mouse is not clicked on a button
      for (let user of this.users){
        let element: any = document.getElementById("roleDropdown"+user.name);
        if (element.classList.contains("show")){
          element.classList.remove("show");
        }
      }
      let element: any = document.getElementById("newUserRoleDropdown");
      if (element.classList.contains("show")){
        element.classList.remove("show");
      }
    }
  }
}
