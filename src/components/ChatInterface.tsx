import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatState, AdminSettings } from '../types';
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';
import MarkdownText from './MarkdownText';
import { generateWhatsAppLink, detectPositiveIntent } from '../services/whatsapp';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  state: ChatState;
  settings: AdminSettings;
  onSend: (text: string) => void;
  onNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, settings, onSend, onNewChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg?.role === 'model' && !state.isThinking) {
      if (lastMsg.content.includes("botão de conexão") || detectPositiveIntent(state.messages[state.messages.length - 2]?.content || '')) {
        setWhatsappLink(generateWhatsAppLink(state.messages, settings.whatsappNumber));
      }
    }
  }, [state.messages, state.isThinking]);

  return (
    <div className="flex flex-col h-full">
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full pt-10 pb-40">
        {state.messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div className={cn("max-w-[90%] rounded-2xl p-4 shadow-xl", msg.role === 'user' ? 'bg-champagne text-white' : 'bg-[#1A2333] text-gray-100')}>
              <MarkdownText content={msg.content} />
              {msg.role === 'model' && whatsappLink && msg.id === state.messages[state.messages.length - 1].id && (
                <div className="mt-4">
                  <a href={whatsappLink} target="_blank" className="flex items-center justify-center gap-2 bg-green-600 p-3 rounded-xl font-bold">
                    <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
      <div className="fixed bottom-0 left-72 right-0 p-4 bg-gradient-to-t from-[#0B1120] to-transparent">
        <InputBar onSend={onSend} isThinking={state.isThinking} />
      </div>
    </div>
  );
};

export default ChatInterface;