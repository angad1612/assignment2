import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { GroupsComponent } from './groups/groups.component';
import { LoginComponent } from './login/login.component';
import { ManageGroupUsersComponent } from './manage-group-users/manage-group-users.component';
import { ProfileComponent } from './profile/profile.component';
import { ServicesComponent } from './services/services.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    GroupsComponent,
    LoginComponent,
    ManageGroupUsersComponent,
    ProfileComponent,
    ServicesComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
