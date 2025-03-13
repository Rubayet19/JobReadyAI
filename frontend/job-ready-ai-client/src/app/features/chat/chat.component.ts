import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { Observable, finalize, take } from 'rxjs';
import { ChatMessage } from '../../core/models/chat.model';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Conversation } from '../../core/services/chat-storage.service';

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
  conversations$: Observable<Conversation[]>;
  currentConversation$: Observable<Conversation | null>;
  isLoading = false;
  newMessage = '';
  showConversationsMenu = false;
  editingTitle = false;
  newTitle = '';
  private shouldScroll = true;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.messages$ = this.chatService.messages$;
    this.conversations$ = this.chatService.conversations$;
    this.currentConversation$ = this.chatService.currentConversation$;
  }

  ngOnInit() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Close menus when clicking outside
    document.addEventListener('click', (event) => {
      if (this.showConversationsMenu && !(event.target as Element).closest('.conversations-menu-container')) {
        this.showConversationsMenu = false;
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

  toggleConversationsMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showConversationsMenu = !this.showConversationsMenu;
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      this.chatService.clearChat();
    }
  }

  exportAsPDF(): void {
    this.chatService.exportChatAsPDF();
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
  }

  createNewConversation(): void {
    // Check if there's an existing conversation with content
    this.currentConversation$.pipe(take(1)).subscribe(currentConversation => {
      if (currentConversation && currentConversation.messages.length > 0) {
        this.chatService.createNewConversation();
        this.showConversationsMenu = false;
      } else if (this.newMessage.trim()) {
        // If there's text in the input but no conversation yet, create one
        this.chatService.createNewConversation();
        this.showConversationsMenu = false;
      }
    });
  }

  loadConversation(conversationId: string): void {
    this.chatService.loadConversation(conversationId);
    this.showConversationsMenu = false;
  }

  deleteConversation(event: MouseEvent, conversationId: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.chatService.deleteConversation(conversationId);
    }
  }

  startEditingTitle(): void {
    this.editingTitle = true;
    // Get current title from the service
    const currentConversation = this.chatService.currentConversation$.subscribe(
      conversation => {
        if (conversation) {
          this.newTitle = conversation.title;
          setTimeout(() => {
            const titleInput = document.getElementById('title-input');
            if (titleInput) {
              titleInput.focus();
            }
          }, 0);
        }
      }
    );
  }

  saveTitle(): void {
    if (this.newTitle.trim()) {
      this.chatService.updateConversationTitle(this.newTitle.trim());
    }
    this.editingTitle = false;
  }

  cancelEditingTitle(): void {
    this.editingTitle = false;
  }

  handleTitleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelEditingTitle();
    }
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

  formatDate(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Same day
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Within the last week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', hour: '2-digit', minute: '2-digit' };
      return messageDate.toLocaleString([], options);
    }
    
    // Older than a week
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return messageDate.toLocaleString([], options);
  }
}