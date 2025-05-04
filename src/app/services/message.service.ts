import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number;
  created_at?: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  options?: string[];
  userId?: number;
}

export interface MessagePair {
  userMessage: Message;
  botMessage: Message;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api/messages/';

  constructor(private http: HttpClient) { }

  sendMessage(message: Message): Observable<Message> {
    const user = localStorage.getItem('furiaUser');
    if (user) {
      const userData = JSON.parse(user);
      message.userId = userData.id;
    }
    return this.http.post<Message>(this.apiUrl, message);
  }

  getMessageHistory(): Observable<MessagePair[]> {
    const user = localStorage.getItem('furiaUser');
    if (user) {
      const userData = JSON.parse(user);
      return this.http.get<MessagePair[]>(`${this.apiUrl}?userId=${userData.id}`);
    }
    return this.http.get<MessagePair[]>(this.apiUrl);
  }

  getNewMessages(lastTimestamp: string): Observable<MessagePair[]> {
    const user = localStorage.getItem('furiaUser');
    if (user) {
      const userData = JSON.parse(user);
      return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}&userId=${userData.id}`);
    }
    return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`);
  }
} 