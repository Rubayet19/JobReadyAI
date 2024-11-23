export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatRequest {
  message: string;
  conversationHistory: MessageHistory[];
}

export interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
}