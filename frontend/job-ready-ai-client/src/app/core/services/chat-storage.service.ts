import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/chat.model';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {
  private readonly STORAGE_KEY = 'chat_conversations';
  private readonly DEVICE_ID_KEY = 'device_id';
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  /**
   * Gets or creates a unique device identifier
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  }

  /**
   * Gets the storage key with device ID to make it device-specific
   */
  private getDeviceStorageKey(): string {
    return `${this.STORAGE_KEY}_${this.deviceId}`;
  }

  /**
   * Gets all conversations from localStorage
   */
  getConversations(): Conversation[] {
    const storageKey = this.getDeviceStorageKey();
    const conversationsJson = localStorage.getItem(storageKey);
    
    if (!conversationsJson) {
      return [];
    }
    
    try {
      const conversations = JSON.parse(conversationsJson) as Conversation[];
      
      // Convert string dates back to Date objects
      return conversations.map(conversation => ({
        ...conversation,
        createdAt: new Date(conversation.createdAt),
        updatedAt: new Date(conversation.updatedAt),
        messages: conversation.messages.map(message => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error parsing conversations from localStorage:', error);
      return [];
    }
  }

  /**
   * Gets a specific conversation by ID
   */
  getConversation(conversationId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.id === conversationId) || null;
  }

  /**
   * Saves a conversation to localStorage
   */
  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    // Update the updatedAt timestamp
    conversation.updatedAt = new Date();
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    this.saveConversations(conversations);
  }

  /**
   * Creates a new conversation
   */
  createConversation(title: string = 'New Conversation'): Conversation {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Deletes a conversation by ID
   */
  deleteConversation(conversationId: string): void {
    const conversations = this.getConversations();
    const filteredConversations = conversations.filter(c => c.id !== conversationId);
    this.saveConversations(filteredConversations);
  }

  /**
   * Clears all conversations
   */
  clearAllConversations(): void {
    localStorage.removeItem(this.getDeviceStorageKey());
  }

  /**
   * Updates the title of a conversation
   */
  updateConversationTitle(conversationId: string, title: string): void {
    const conversations = this.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.saveConversations(conversations);
    }
  }

  /**
   * Saves conversations to localStorage
   */
  private saveConversations(conversations: Conversation[]): void {
    const storageKey = this.getDeviceStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  }
} 