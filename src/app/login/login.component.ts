import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginDetails = {username: "", password: ""}
  showError:boolean = false;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit(): void {
  }

  loginClicked(){
    this.dataService.login(this.loginDetails).then((data: any) => {
        if (data.user){
          localStorage.setItem("currentUser", data.user);
          this.showError = false;
          this.router.navigateByUrl("/");
        } else {
          this.showError = true;
        }
      })
  }

}
