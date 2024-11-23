import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { Observable, finalize } from 'rxjs';
import { ChatMessage } from '../../core/models/chat.model';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[100vh] overflow-hidden">
      <div class="flex-none py-3">
        <div class="max-w-3xl mx-auto px-4">
          <div class="flex justify-center items-center">
            <h1 class="text-3xl font-semibold text-gray-800">
              JobReadyAI Interview Assistant
            </h1>
          </div>
        </div>
      </div>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto" #scrollContainer>
        <!-- Welcome Message -->
        <div *ngIf="(messages$ | async)?.length === 0" 
             class="h-full flex items-center justify-center p-4">
          <div class="text-center max-w-2xl">
            <div class="mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
            </div>
            <h2 class="text-2xl font-semibold mb-2 text-gray-800">Welcome to JobReadyAI</h2>
            <p class="text-gray-600">
              Enter a job description below to get tailored interview questions.
            </p>
          </div>
        </div>

        <!-- Messages -->
        <div class="w-full">
          <ng-container *ngFor="let message of messages$ | async">
            <!-- User Message -->
            <div *ngIf="message.isUser" class="bg-white">
              <div class="max-w-3xl mx-auto px-4 py-6 flex gap-4">
                <div class="w-7 h-7 shrink-0 rounded-sm flex items-center justify-center bg-blue-600 text-white">
                  <span class="text-xs">You</span>
                </div>
                <div class="flex-1 whitespace-pre-wrap text-sm">
                  {{ message.content }}
                </div>
              </div>
            </div>

            <!-- AI Message -->
            <div *ngIf="!message.isUser" class="bg-gray-50">
              <div class="max-w-3xl mx-auto px-4 py-6 flex gap-4">
                <div class="w-7 h-7 shrink-0 rounded-sm flex items-center justify-center bg-teal-600 text-white">
                  <span class="text-xs">AI</span>
                </div>
                <div class="flex-1">
                  <div class="prose prose-sm max-w-none">
                    <div [innerHTML]="parseMarkdown(message.content)"></div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Loading Indicator -->
          <div *ngIf="isLoading" class="bg-gray-50">
            <div class="max-w-3xl mx-auto px-4 py-6 flex gap-4">
              <div class="w-7 h-7 shrink-0 rounded-sm flex items-center justify-center bg-teal-600 text-white">
                <span class="text-xs">AI</span>
              </div>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="flex-none p-4 bg-white">
        <div class="max-w-3xl mx-auto">
          <form (ngSubmit)="sendMessage()" class="relative">
            <textarea
              [(ngModel)]="newMessage"
              name="message"
              rows="2"
              [disabled]="isLoading"
              (keydown)="handleEnterKey($event)"
              class="w-full resize-none rounded-lg border border-gray-200 bg-white pr-32 pl-4 py-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100"
              placeholder="Paste your job description here..."
            ></textarea>
            <div class="absolute right-2 bottom-2 flex gap-2">
              <!-- Clear Chat Button -->
              <button
                type="button"
                (click)="clearChat()"
                class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 group relative"
                title="Clear chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
                </svg>
                <span class="absolute bottom-full mb-2 w-auto min-w-max bg-gray-900 text-white text-xs px-2 py-1 rounded-md invisible group-hover:visible">
                  Clear chat history
                </span>
              </button>
  
              <!-- Export Button -->
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleExportMenu($event)"
                  class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 group relative"
                  title="Export chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                  </svg>
                  <span class="absolute bottom-full mb-2 w-auto min-w-max bg-gray-900 text-white text-xs px-2 py-1 rounded-md invisible group-hover:visible">
                    Export chat
                  </span>
                </button>
  
                <!-- Export dropdown menu -->
                <div *ngIf="showExportMenu" 
                     class="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div class="py-1">
                    <button
                      type="button"
                      (click)="exportAsPDF()"
                      class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Export as PDF
                    </button>
                    <button
                      type="button"
                      (click)="exportAsText()"
                      class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Export as Text
                    </button>
                  </div>
                </div>
              </div>
  
              <!-- Send Button -->
              <button
                type="submit"
                [disabled]="!newMessage.trim() || isLoading"
                class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:hover:bg-transparent disabled:opacity-40 group relative"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  class="w-5 h-5"
                >
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
                <span class="absolute bottom-full mb-2 w-auto min-w-max bg-gray-900 text-white text-xs px-1 py-1 rounded-md invisible group-hover:visible">
                  Send
                </span>
              </button>
            </div>
          </form>
          <div class="text-center mt-2">
            <p class="text-xs text-gray-500">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .prose {
      font-size: 0.875rem;
      line-height: 1.5;

      ::ng-deep {
        p { 
          margin-bottom: 1rem;
        }
        
        ul, ol { 
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        li { 
          margin-bottom: 0.5rem;
        }

        strong { 
          font-weight: 600;
          color: #2d3748;
          display: block;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        em { 
          display: block;
          color: #4a5568;
          font-style: normal;
          margin-left: 1rem;
          margin-bottom: 1rem;
        }

        h1, h2, h3, h4 {
          font-weight: 600;
          color: #1a202c;
          margin: 1.5rem 0 1rem 0;
        }
      }
    }
  `]
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  messages$: Observable<ChatMessage[]>;
  isLoading = false;
  newMessage = '';
  showExportMenu = false;
  private shouldScroll = true;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.messages$ = this.chatService.messages$;
  }

  ngOnInit() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Close export menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.showExportMenu && !(event.target as Element).closest('.relative')) {
        this.showExportMenu = false;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
      this.cdr.detectChanges();
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  handleEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  parseMarkdown(content: string): SafeHtml {
    try {
      const html = marked.parse(content);
      if (typeof html === 'string') {
        return this.sanitizer.bypassSecurityTrustHtml(html);
      }
      return this.sanitizer.bypassSecurityTrustHtml(content);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }
  }

  toggleExportMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showExportMenu = !this.showExportMenu;
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      this.chatService.clearChat();
    }
  }

  exportAsPDF(): void {
    this.chatService.exportChatAsPDF();
    this.showExportMenu = false;
  }

  exportAsText(): void {
    const text = this.chatService.exportChatAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showExportMenu = false;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;
    
    const message = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;
    this.shouldScroll = true;
    
    this.chatService.sendMessage(message)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          // Force scroll after response is received
          setTimeout(() => {
            this.shouldScroll = true;
            this.scrollToBottom();
          }, 100);
        })
      )
      .subscribe({
        next: (_response) => {
          // Message handling is done in the service
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
  }
}