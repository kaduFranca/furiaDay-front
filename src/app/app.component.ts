import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTA O CommonModule
import { RouterModule } from '@angular/router';
import { ConfigComponent } from "./components/config/config.component";
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfigComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  
}
