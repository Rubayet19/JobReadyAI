import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ChatMessage, ChatRequest, ChatResponse, MessageHistory } from '../models/chat.model';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  clearChat(): void {
    this.messagesSubject.next([]);
  }

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

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  private updateMessageStatus(messageId: string, status: 'sending' | 'sent' | 'error'): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    );
    this.messagesSubject.next(updatedMessages);
  }
}