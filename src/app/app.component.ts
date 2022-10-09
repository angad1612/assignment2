import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'assignment';

  showNavBar: boolean = true;
  showUsers: boolean | null = null;

  checkingAuth: any = undefined;

  constructor(private router: Router, private dataService: DataService) { }

  // Hide the nav bar if the player is on the login screen and hide the users nav link if they are not a super admin or group admin
  ngAfterViewChecked(): void{
    // This causes an error when in debug mode
    if (this.router.url == "/login"){
      this.showNavBar = false;
      this.showUsers = null;
    } else{
      this.showNavBar = true;
      // Check if there is a current user and redirect to the login screen if there isn't
      let currentUser: string | null = localStorage.getItem("currentUser");
      if (!currentUser){
        this.router.navigateByUrl("/login");
      } else if (this.showUsers == null){
        // Show the users nav link if the user is a super admin or group admin
        this.dataService.checkUserAuthorised("groupAdmin").then((result: any) => {
          this.showUsers = result.authorised;
        });
      }
    }
  }

  logOut(): void{
    localStorage.removeItem("currentUser");
    this.router.navigateByUrl("/login");
    this.showUsers = false;
  }
}
