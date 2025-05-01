import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: string;
  content: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'https://furia-day-api.vercel.app/messages/';

  constructor(private http: HttpClient) { }

  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  getMessageHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }
} 