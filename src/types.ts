export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isThinking: boolean;
}

export interface AdminSettings {
  officeName: string;
  officeDescription: string;
  foundersInfo: string;
  addresses: string;
  malicePrompt: string;
  negativePrompt: string;
  whatsappNumber: string;
  internalInstructions: string;
}

export enum ViewMode {
  LANDING = 'landing',
  CHAT = 'chat',
  ADMIN = 'admin'
}