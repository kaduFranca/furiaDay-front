import { Routes } from '@angular/router';
import { ConfigComponent } from './components/config/config.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: 'dev', component: ConfigComponent },
  {
    path: '',
    component: ChatComponent
  }
];
