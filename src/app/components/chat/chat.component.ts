import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  messages: Message[] = [
    {
      text: 'Estou aqui para conversar sobre games e eSports! O que você quer saber hoje?',
      isBot: true,
      timestamp: this.getCurrentTime()
    }
  ];
  newMessage: string = '';

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: Message = {
      text: this.newMessage,
      isBot: false,
      timestamp: this.getCurrentTime()
    };

    this.messages.push(userMessage);
    this.newMessage = '';

    // Simular resposta do bot
    setTimeout(() => {
      const botMessage: Message = {
        text: this.getBotResponse(userMessage.text),
        isBot: true,
        timestamp: this.getCurrentTime()
      };
      this.messages.push(botMessage);
    }, 1000);
  }

  getBotResponse(message: string): string {
    if (message.toLowerCase().includes('cs') || message.toLowerCase().includes('furia')) {
      return 'A FURIA tem uma das melhores equipes de CS do Brasil! Eles têm competido em vários torneios internacionais e conquistado ótimos resultados. Quer saber mais sobre algum jogador específico?';
    }
    return 'Me desculpe, não entendi sua pergunta. Pode reformular?';
  }
} 