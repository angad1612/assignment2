import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { Observable } from 'rxjs';
import io from "socket.io-client";
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  group: string = "";
  channel: string = "";
  chat: any[] = [];
  profilePics: any = {};
  invalidFileWarning: string = "";
  textInput: string = "";
  imageInput: string = "";
  socket: any;
  authCheck: any;
  currentUser: string | null = "";

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    // Get the group and channel
    this.group = this.route.snapshot.params['group'];
    this.channel = this.route.snapshot.params['channel'];
    this.currentUser = localStorage.getItem("currentUser")

    // Create the socket
    this.socket = io("http://localhost:3000");
    // Join the room
    this.socket.emit("join", this.group, this.channel, this.currentUser);
    // Leave the chat page if the server disconencts them (likely due to not being authorised)
    this.socket.on("disconnect", () => {
      this.router.navigateByUrl("/");
    });

    // Get the current chat
    this.chat = await this.dataService.getChat(this.group, this.channel);
    await (new Promise(resolve => setTimeout(resolve, 1)));
    // Scroll to the bottem of the chat
    let element: any = document.getElementById("chatScrollArea");
    if (element){
      element.scrollTop = element.scrollHeight
    }
    // Get the everyones profile pictures
    this.profilePics = await this.dataService.getProfilePics();

    // Start listeing for messages
    this.socket.on("message", async (message: any) =>{
      let scrollAreaAtBottom = element.scrollHeight - element.scrollTop == element.clientHeight;
      this.chat.push(message);
      await (new Promise(resolve => setTimeout(resolve, 1)));
      if (scrollAreaAtBottom){
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  // Get the uploaded image when it's changed
  onFileChanged(event: any){
    if (event.target.files.length > 0){
      const fileReader = new FileReader();
      fileReader.readAsDataURL(event.target.files[0]);
      fileReader.onload = () => {
        // Check if the file is an image
        if (fileReader.result?.toString().includes("data:image")){
          this.imageInput = fileReader.result.toString();
          this.invalidFileWarning = "";
        } else{
          this.invalidFileWarning = "WARNING: This file is not an image!";
        }
      }
    }
  }

  // Send the message to the chat
  sendMessage(socket: any = null){
    if (this.textInput || this.imageInput){
      this.socket.emit("message", {"text": this.textInput, "image": this.imageInput, "user": this.currentUser});
      this.invalidFileWarning = "";
      this.textInput = "";
      this.imageInput = "";
      let element: any = document.getElementById("imageInput");
      element.value = "";
    }
  }
}
