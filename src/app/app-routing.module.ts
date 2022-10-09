import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './groups/groups.component';
import { ManageGroupUsersComponent } from './manage-group-users/manage-group-users.component';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  {path: "", component: GroupsComponent}, 
  {path: "manageGroupUsers/:group", component: ManageGroupUsersComponent}, 
  {path: "login", component: LoginComponent}, 
  {path: "users", component: UsersComponent}, 
  {path: "profile", component: ProfileComponent}, 
  {path: "chat/:group/:channel", component: ChatComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
