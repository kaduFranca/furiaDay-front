import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Message as ApiMessage } from '../../services/message.service';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: string;
  id?: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeFormatPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  private pollingSubscription?: Subscription;
  private lastBotMessageId?: number;
  private shouldScroll = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadMessages();
    this.startPolling();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error('Erro ao rolar para o final:', err);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    // Verifica novas mensagens a cada 2 segundos
    this.pollingSubscription = interval(2000)
      .pipe(
        switchMap(() => this.messageService.getMessageHistory())
      )
      .subscribe({
        next: (allMessages) => {
          if (allMessages && allMessages.length > 0) {
            // Encontra a última mensagem do bot
            const botMessages = allMessages.filter(msg => msg.isBot);
            const lastBotMessage = botMessages[botMessages.length - 1];
            
            // Se encontrou uma mensagem do bot e é diferente da última que já temos
            if (lastBotMessage && lastBotMessage.id !== this.lastBotMessageId) {
              // Atualiza o ID da última mensagem do bot
              this.lastBotMessageId = lastBotMessage.id;
              
              // Verifica se a mensagem já existe no chat
              const messageExists = this.messages.some(msg => msg.id === lastBotMessage.id);
              
              if (!messageExists) {
                // Adiciona a nova mensagem do bot ao chat
                const newChatMessage: ChatMessage = {
                  text: lastBotMessage.content,
                  isBot: lastBotMessage.isBot,
                  timestamp: lastBotMessage.timestamp,
                  id: lastBotMessage.id
                };
                
                this.messages = [...this.messages, newChatMessage];
                this.shouldScroll = true;
              }
            }
          }
        },
        error: (error) => {
          console.error('Erro ao verificar novas mensagens:', error);
        }
      });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private loadMessages() {
    this.messageService.getMessageHistory().subscribe({
      next: (apiMessages) => {
        if (apiMessages && apiMessages.length > 0) {
          this.messages = apiMessages.map(msg => ({
            text: msg.content,
            isBot: msg.isBot,
            timestamp: msg.timestamp,
            id: msg.id
          }));
          
          // Encontra a última mensagem do bot e salva seu ID
          const botMessages = apiMessages.filter(msg => msg.isBot);
          if (botMessages.length > 0) {
            this.lastBotMessageId = botMessages[botMessages.length - 1].id;
          }
          this.shouldScroll = true;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar mensagens:', error);
        this.messages = [{
          text: 'Estou aqui para conversar sobre games e eSports! O que você quer saber hoje?',
          isBot: true,
          timestamp: this.getCurrentTime()
        }];
        this.shouldScroll = true;
      }
    });
  }

  private getCurrentTime(): string {
    return new Date().toISOString();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: ChatMessage = {
      text: this.newMessage,
      isBot: false,
      timestamp: this.getCurrentTime()
    };

    this.messages.push(userMessage);
    this.newMessage = '';
    this.shouldScroll = true;

    const apiMessage: ApiMessage = {
      content: userMessage.text,
      isBot: false,
      timestamp: userMessage.timestamp
    };

    this.messageService.sendMessage(apiMessage).subscribe({
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage: ChatMessage = {
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          isBot: true,
          timestamp: this.getCurrentTime()
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
      }
    });
  }
} 