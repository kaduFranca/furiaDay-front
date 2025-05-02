import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number;
  created_at?: string;
  content: string;
  isBot: boolean;
  timestamp: string;
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
    return this.http.post<Message>(this.apiUrl, message);
  }

  getMessageHistory(): Observable<MessagePair[]> {
    return this.http.get<MessagePair[]>(this.apiUrl);
  }

  getNewMessages(lastTimestamp: string): Observable<MessagePair[]> {
    return this.http.get<MessagePair[]>(`${this.apiUrl}?since=${lastTimestamp}`);
  }
} 