// src/app/app.component.ts
import { Component } from '@angular/core';
import { ChatComponent } from './features/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  template: `
    <div class="app-container">

      
      <main class="container mx-auto p-4">
        <app-chat></app-chat>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    main {
      flex: 1;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {}