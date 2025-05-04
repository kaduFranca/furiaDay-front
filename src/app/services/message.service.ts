import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Message {
  id?: number;
  created_at?: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  options?: Array<{
    text: string;
    link?: string;
  }>;
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
  private apiUrl = 'https://furia-day-api.vercel.app/messages';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });

  constructor(private http: HttpClient) { }

  sendMessage(message: Message): Observable<Message> {
    const user = localStorage.getItem('furiaUser');
    if (user) {
      const userData = JSON.parse(user);
      message.userId = userData.id;
    }
    return this.http.post<Message>(this.apiUrl, message, { headers: this.headers });
  }

  getMessageHistory(): Observable<MessagePair[]> {
    const user = localStorage.getItem('furiaUser');
    if (!user) {
      return this.http.get<MessagePair[]>(this.apiUrl, { headers: this.headers });
    }
    
    const userData = JSON.parse(user);
    return this.http.get<MessagePair[]>(this.apiUrl, { headers: this.headers }).pipe(
      map(messages => {
        return messages.filter(pair => {
          return pair.userMessage.userId === userData.id;
        });
      })
    );
  }

  getNewMessages(lastTimestamp: string): Observable<MessagePair[]> {
    const user = localStorage.getItem('furiaUser');
    if (user) {
      const userData = JSON.parse(user);
      return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`, { headers: this.headers }).pipe(
        map(messages => {
          return messages.filter(pair => {
            return pair.userMessage.userId === userData.id;
          });
        })
      );
    }
    return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`, { headers: this.headers });
  }
} 