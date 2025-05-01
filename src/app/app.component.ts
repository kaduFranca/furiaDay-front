import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTA O CommonModule
import { SupabaseService } from './services/supabase.service';
import { RouterModule } from '@angular/router';
import { ConfigComponent } from "./components/config/config.component";
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfigComponent, ChatComponent], // Aqui você coloca os módulos usados no template
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  data: any;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.data = await this.supabaseService.getData();
  }
}
