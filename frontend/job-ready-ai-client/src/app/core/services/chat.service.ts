import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ChatMessage, ChatRequest, ChatResponse, MessageHistory } from '../models/chat.model';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import { ChatStorageService, Conversation } from './chat-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private currentConversationSubject = new BehaviorSubject<Conversation | null>(null);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  
  messages$ = this.messagesSubject.asObservable();
  currentConversation$ = this.currentConversationSubject.asObservable();
  conversations$ = this.conversationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private chatStorageService: ChatStorageService
  ) {
    this.loadConversations();
    this.createNewConversation();
  }

  /**
   * Loads all conversations from storage
   */
  loadConversations(): void {
    const conversations = this.chatStorageService.getConversations();
    this.conversationsSubject.next(conversations);
  }

  /**
   * Creates a new conversation and sets it as current
   */
  createNewConversation(title: string = 'New Conversation'): void {
    const newConversation = this.chatStorageService.createConversation(title);
    this.setCurrentConversation(newConversation);
    
    // Add to conversations list
    const conversations = this.conversationsSubject.value;
    this.conversationsSubject.next([...conversations, newConversation]);
  }

  /**
   * Sets the current conversation and loads its messages
   */
  setCurrentConversation(conversation: Conversation): void {
    this.currentConversationSubject.next(conversation);
    this.messagesSubject.next(conversation.messages);
  }

  /**
   * Loads a conversation by ID
   */
  loadConversation(conversationId: string): void {
    const conversation = this.chatStorageService.getConversation(conversationId);
    if (conversation) {
      this.setCurrentConversation(conversation);
    }
  }

  /**
   * Deletes a conversation
   */
  deleteConversation(conversationId: string): void {
    this.chatStorageService.deleteConversation(conversationId);
    
    // Update conversations list
    this.loadConversations();
    
    // If the current conversation was deleted, create a new one
    const currentConversation = this.currentConversationSubject.value;
    if (currentConversation && currentConversation.id === conversationId) {
      this.createNewConversation();
    }
  }

  /**
   * Updates the title of the current conversation
   */
  updateConversationTitle(title: string): void {
    const currentConversation = this.currentConversationSubject.value;
    if (currentConversation) {
      this.chatStorageService.updateConversationTitle(currentConversation.id, title);
      
      // Update current conversation
      currentConversation.title = title;
      this.currentConversationSubject.next({...currentConversation});
      
      // Update conversations list
      this.loadConversations();
    }
  }

  /**
   * Sends a message to the API
   */
  sendMessage(content: string): Observable<ChatResponse> {
    const messageId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: messageId,
      content,
      timestamp: new Date(),
      isUser: true,
      status: 'sent'
    };

    this.addMessage(userMessage);

    const conversationHistory: MessageHistory[] = this.messagesSubject.value.map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    const request: ChatRequest = {
      message: content,
      conversationHistory: conversationHistory.slice(0, -1)
    };

    return this.http.post<ChatResponse>(this.apiUrl, request).pipe(
      tap(response => {
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          content: response.response,
          timestamp: new Date(),
          isUser: false,
          status: 'sent'
        };
        this.addMessage(aiMessage);
      }),
      catchError(error => {
        this.updateMessageStatus(messageId, 'error');
        return throwError(() => error);
      })
    );
  }

  /**
   * Clears the current chat
   */
  clearChat(): void {
    if (this.currentConversationSubject.value) {
      // Create a new conversation with the same title
      const currentTitle = this.currentConversationSubject.value.title;
      this.createNewConversation(currentTitle);
    } else {
      this.messagesSubject.next([]);
    }
  }

  /**
   * Exports the current chat as PDF
   */
  exportChatAsPDF(): void {
    const doc = new jsPDF();
    const messages = this.messagesSubject.value;
    let yPos = 20;

    doc.setFontSize(16);
    doc.text('Chat Export', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    messages.forEach((message) => {
      const sender = message.isUser ? 'You' : 'AI';
      const timestamp = message.timestamp.toLocaleString();
      const content = `${sender} (${timestamp}): ${message.content}`;
      
      const lines = doc.splitTextToSize(content, 170);
      
      if (yPos + (lines.length * 7) > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 7) + 5;
    });
    
    doc.save('chat-export.pdf');
  }

  /**
   * Exports the current chat as text
   */
  exportChatAsText(): string {
    const messages = this.messagesSubject.value;
    let textContent = 'Chat Export\n\n';
    
    messages.forEach((message) => {
      const sender = message.isUser ? 'You' : 'AI';
      const timestamp = message.timestamp.toLocaleString();
      textContent += `${sender} (${timestamp}):\n${message.content}\n\n`;
    });
    
    return textContent;
  }

  /**
   * Adds a message to the current conversation
   */
  private addMessage(message: ChatMessage): void {
    // Add to messages subject
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
    
    // Update current conversation
    const currentConversation = this.currentConversationSubject.value;
    if (currentConversation) {
      currentConversation.messages = [...currentConversation.messages, message];
      currentConversation.updatedAt = new Date();
      
      // Save to storage
      this.chatStorageService.saveConversation(currentConversation);
      
      // Update current conversation subject
      this.currentConversationSubject.next({...currentConversation});
      
      // Update first message as title if it's the first user message
      if (currentConversation.title === 'New Conversation' && 
          message.isUser && 
          currentConversation.messages.filter(m => m.isUser).length === 1) {
        const title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
        this.updateConversationTitle(title);
      }
    }
  }

  /**
   * Updates the status of a message
   */
  private updateMessageStatus(messageId: string, status: 'sending' | 'sent' | 'error'): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    );
    this.messagesSubject.next(updatedMessages);
    
    // Update in storage
    const currentConversation = this.currentConversationSubject.value;
    if (currentConversation) {
      currentConversation.messages = updatedMessages;
      this.chatStorageService.saveConversation(currentConversation);
    }
  }
}