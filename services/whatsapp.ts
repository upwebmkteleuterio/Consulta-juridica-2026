
import { Message } from "../types";

export const generateWhatsAppLink = (messages: Message[], phoneNumber: string) => {
  const conversation = messages.map(m => {
    const role = m.role === 'user' ? 'Cliente' : 'IA';
    return `${role}: ${m.content}`;
  }).join('\n\n---\n\n');
  
  const baseMessage = `Olá, vim através da IA jurídica e este é o histórico completo de nossa conversa:\n\n${conversation}`;
  const encodedMessage = encodeURIComponent(baseMessage);
  
  // Remove qualquer caractere não numérico do telefone antes de gerar o link
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  return `https://wa.me/55${cleanNumber}?text=${encodedMessage}`;
};

export const detectPositiveIntent = (text: string): boolean => {
  const lower = text.toLowerCase();
  const positivePatterns = [
    "sim", 
    "quero", 
    "claro", 
    "aceito", 
    "pode ser", 
    "agora", 
    "falar", 
    "contatar", 
    "ajuda",
    "gostaria de falar",
    "falar com um de seus advogados"
  ];
  return positivePatterns.some(pattern => lower.includes(pattern)) && lower.length < 100;
};
