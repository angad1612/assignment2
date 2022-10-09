import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: any = {
    "email": "",
    "password": "",
    "profilePic": ""
  };
  invalidFileWarning: string = "";

  constructor(private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    this.userData = await this.dataService.getUserData();
  }

  // Get the uploaded image when it's changed
  onFileChanged(event: any){
    if (event.target.files.length > 0){
      const fileReader = new FileReader();
      fileReader.readAsDataURL(event.target.files[0]);
      fileReader.onload = () => {
        // Check if the file is an image
        if (fileReader.result?.toString().includes("data:image")){
          this.userData.profilePic = fileReader.result;
          this.invalidFileWarning = "";
        } else{
          this.invalidFileWarning = "WARNING: This file is not an image!";
        }
      }
    }
  }

  // Update the user
  async updateUser(){
    let currentUser: string = localStorage.getItem("currentUser") || "this should never be gotten since the user would be redirected if currentUser is null";
    await this.dataService.updateUser(currentUser, this.userData)
    this.userData = await this.dataService.getUserData();
  }

}
