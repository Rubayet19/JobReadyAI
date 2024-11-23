import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../core/models/chat.model';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message" [ngClass]="{'user-message': message.isUser, 'ai-message': !message.isUser}">
      <div class="message-content" [innerHTML]="parsedContent"></div>
      <div class="message-timestamp">{{ message.timestamp | date:'short' }}</div>
    </div>
  `,
  styles: [`
    .message {
      max-width: 80%;
      margin: 0.5rem 0;
      padding: 0.75rem;
      border-radius: 8px;
      
      &.user-message {
        margin-left: auto;
        background: #007bff;
        color: white;
      }
      
      &.ai-message {
        margin-right: auto;
        background: white;
        border: 1px solid #dee2e6;
        
        ::ng-deep {
          p { margin-bottom: 0.5rem; }
          strong { font-weight: 600; }
          ul, ol { margin: 0.5rem 0; padding-left: 1.5rem; }
          li { margin-bottom: 0.25rem; }
          h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; }
          em { 
            font-style: italic; 
            color: #666;
            display: block;
            margin-top: 0.25rem;
            margin-left: 1rem;
            font-size: 0.9rem;
          }
          h2, h3, h4 { 
            font-weight: 600;
            color: #2c3e50;
            margin-top: 1rem;
          }
          /* Style for the question categories */
          h4 {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
          }
        }
      }
    }

    .message-timestamp {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-top: 0.25rem;
    }
  `]
})
export class MessageComponent implements OnChanges {
  @Input() message!: ChatMessage;
  parsedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({
      breaks: true,  // Adds <br> on single line breaks
      gfm: true      // GitHub Flavored Markdown
    });
  }

  ngOnChanges(): void {
    if (this.message && !this.message.isUser) {
      // Convert markdown to HTML synchronously
      const htmlContent = marked.parse(this.message.content);
      // Ensure we're working with a string
      if (typeof htmlContent === 'string') {
        this.parsedContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
      } else {
        // Handle the case where htmlContent is a Promise
        this.parsedContent = this.sanitizer.bypassSecurityTrustHtml(this.message.content);
      }
    } else {
      this.parsedContent = this.message.content;
    }
  }
}