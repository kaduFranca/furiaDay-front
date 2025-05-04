import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Message as ApiMessage, MessagePair } from '../../services/message.service';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { LineBreakPipe } from '../../pipes/line-break.pipe';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: string;
  id?: number;
  isError?: boolean;
  options?: string[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeFormatPipe, LineBreakPipe],
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
  showConfigModal = false;
  configData = { username: '', password: '', selected_team: '' };
  teams = ['furia ma', 'furia fe', 'furia academy'];
  configError = '';
  configSuccess = false;

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
            // Transforma os pares em um array único e ordena por timestamp
            const flatMessages = allMessages.flatMap(pair => [pair.userMessage, pair.botMessage])
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            // Encontra a última mensagem do bot
            const botMessages = flatMessages.filter(msg => msg.isBot);
            const lastBotMessage = botMessages[botMessages.length - 1];
            
            // Se encontrou uma mensagem do bot e é diferente da última que já temos
            if (lastBotMessage && lastBotMessage.id !== this.lastBotMessageId) {
              // Atualiza o ID da última mensagem do bot
              this.lastBotMessageId = lastBotMessage.id;
              
              // Verifica se a mensagem já existe no chat
              const messageExists = this.messages.some(msg => msg.id === lastBotMessage.id);
              
              if (!messageExists) {
                // Atualiza todas as mensagens mantendo a ordem correta
                this.messages = flatMessages.map(msg => ({
                  text: msg.content,
                  isBot: msg.isBot,
                  timestamp: msg.timestamp,
                  id: msg.id,
                  options: msg.options
                }));
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
          // Transforma os pares de mensagens em um array único e ordena por timestamp
          const allMessages = apiMessages.flatMap(pair => [pair.userMessage, pair.botMessage])
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          this.messages = allMessages.map(msg => ({
            text: msg.content,
            isBot: msg.isBot,
            timestamp: msg.timestamp,
            id: msg.id,
            options: msg.options
          }));
          
          // Encontra a última mensagem do bot e salva seu ID
          const botMessages = allMessages.filter(msg => msg.isBot);
          if (botMessages.length > 0) {
            this.lastBotMessageId = botMessages[botMessages.length - 1].id;
          }
          this.shouldScroll = true;
        } else {
          // Verifica se existe usuário no localStorage
          const user = localStorage.getItem('furiaUser');
          if (!user) {
            this.messages = [{
              text: 'Bem vindo furioso ao chatBot da FURIA! Vejo que você ainda não tem uma conta... crie uma no botão acima',
              isBot: true,
              timestamp: this.getCurrentTime()
            }];
            this.shouldScroll = true;
          }
        }
      },
      error: (error) => {
        console.error('Erro ao carregar mensagens:', error);
        this.messages = [{
          text: 'Estou aqui para conversar sobre games e eSports! O que você quer saber hoje?',
          isBot: true,
          timestamp: this.getCurrentTime(),
          options: ['hoje', 'jogo', 'time', 'equipe', 'jogador', 'partida']
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
      timestamp: ''
    };

    this.messageService.sendMessage(apiMessage).subscribe({
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage: ChatMessage = {
          text: 'Sem conexão com o servidor',
          isBot: true,
          timestamp: this.getCurrentTime(),
          isError: true
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
      }
    });
  }

  sendOptionsMessage() {
    const optionsMessage: ChatMessage = {
      text: 'opções',
      isBot: false,
      timestamp: this.getCurrentTime()
    };

    this.messages.push(optionsMessage);
    this.shouldScroll = true;

    const apiMessage: ApiMessage = {
      content: optionsMessage.text,
      isBot: false,
      timestamp: ''
    };

    this.messageService.sendMessage(apiMessage).subscribe({
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage: ChatMessage = {
          text: 'Sem conexão com o servidor',
          isBot: true,
          timestamp: this.getCurrentTime(),
          isError: true
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
      }
    });
  }

  selectOption(option: string) {
    const optionMessage: ChatMessage = {
      text: option,
      isBot: false,
      timestamp: this.getCurrentTime()
    };

    this.messages.push(optionMessage);
    this.shouldScroll = true;

    const apiMessage: ApiMessage = {
      content: optionMessage.text,
      isBot: false,
      timestamp: ''
    };

    this.messageService.sendMessage(apiMessage).subscribe({
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage: ChatMessage = {
          text: 'Sem conexão com o servidor',
          isBot: true,
          timestamp: this.getCurrentTime(),
          isError: true
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
      }
    });
  }

  openConfigModal() {
    this.showConfigModal = true;
    this.configError = '';
    this.configSuccess = false;
  }

  closeConfigModal() {
    this.showConfigModal = false;
  }

  submitConfigForm() {
    this.configError = '';
    this.configSuccess = false;
    if (!this.configData.username || !this.configData.password || !this.configData.selected_team) {
      this.configError = 'Preencha todos os campos.';
      return;
    }

    // Primeiro tenta fazer login
    fetch('https://furia-day-api.vercel.app/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.configData.username,
        password: this.configData.password,
        selected_team: this.configData.selected_team
      })
    })
    .then(async res => {
      if (res.ok) {
        // Login bem sucedido
        const data = await res.json();
        this.configSuccess = true;
        localStorage.setItem('furiaUser', JSON.stringify({
          id: data.id,
          username: this.configData.username,
          selected_team: this.configData.selected_team
        }));
        setTimeout(() => this.closeConfigModal(), 1500);
        return null;
      } else {
        // Se o login falhar, tenta criar o usuário
        return fetch('https://furia-day-api.vercel.app/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.configData)
        });
      }
    })
    .then(async res => {
      if (res && !res.ok) {
        throw new Error('Erro ao criar usuário');
      }
      if (res) {
        const data = await res.json();
        this.configSuccess = true;
        localStorage.setItem('furiaUser', JSON.stringify({
          id: data.id,
          username: this.configData.username,
          selected_team: this.configData.selected_team
        }));
        setTimeout(() => this.closeConfigModal(), 1500);
      }
      return null;
    })
    .catch(() => {
      this.configError = 'Erro ao autenticar ou criar usuário';
      return null;
    });
  }
} 