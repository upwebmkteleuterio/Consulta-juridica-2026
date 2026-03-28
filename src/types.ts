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

export interface Plan {
  id: string;
  name: string;
  badge: string;
  price: string;
  productId: string;
  checkoutLink: string;
  benefits: string[];
}

export enum ViewMode {
  LANDING = 'landing',
  CHAT = 'chat',
  ADMIN = 'admin'
}