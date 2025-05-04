import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    if (!user) {
      return this.http.get<MessagePair[]>(this.apiUrl);
    }
    
    const userData = JSON.parse(user);
    return this.http.get<MessagePair[]>(this.apiUrl).pipe(
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
      return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`).pipe(
        map(messages => {
          return messages.filter(pair => {
            return pair.userMessage.userId === userData.id;
          });
        })
      );
    }
    return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`);
  }
} 