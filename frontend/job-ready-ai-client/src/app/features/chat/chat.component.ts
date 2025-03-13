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
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
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