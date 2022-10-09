import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
const httpOptions = {
  headers: new HttpHeaders({"Content-Type": "application/json"})
}

const BACKEND_URL = "http://localhost:3000";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor( private httpClient: HttpClient ) { }

  // Send a post request to the backend
  async post(path: string, toSend: object): Promise<any>{
    var values: any;
    await this.httpClient.post(BACKEND_URL + path, toSend)
      .toPromise().then(data => {
        values = data
      })
    return values;
  }

}
