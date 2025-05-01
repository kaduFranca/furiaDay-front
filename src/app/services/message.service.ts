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

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api/messages/';

  constructor(private http: HttpClient) { }

  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  getMessageHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  getNewMessages(lastTimestamp: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}?since=${lastTimestamp}`);
  }
} 