import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { ChatComponent } from './features/chat/chat.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '' }
];
