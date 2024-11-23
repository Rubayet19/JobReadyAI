import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="message-input-container">
      <textarea 
        [(ngModel)]="messageText"
        [disabled]="disabled"
        (keyup.enter)="sendMessage()"
        placeholder="Paste your job description here..."
        rows="3"
        class="input-textarea">
      </textarea>
      <button 
        (click)="sendMessage()"
        [disabled]="!messageText?.trim() || disabled"
        class="send-button">
        Analyze Job Description
      </button>
    </div>
  `,
  styles: [`
    .message-input-container {
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .input-textarea {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.5;
      
      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
      }

      &:disabled {
        background-color: #e9ecef;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #6c757d;
        font-style: italic;
      }
    }
    
    .send-button {
      padding: 0.75rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
      
      &:hover:not(:disabled) {
        background: #0056b3;
      }
      
      &:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }
    }
  `]
})
export class MessageInputComponent {
  @Input() disabled = false;
  @Output() messageSent = new EventEmitter<string>();
  messageText = '';

  sendMessage(): void {
    if (this.messageText?.trim() && !this.disabled) {
      this.messageSent.emit(this.messageText);
      this.messageText = '';
    }
  }
}