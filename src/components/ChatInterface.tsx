import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatState, AdminSettings } from '../types';
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';
import MarkdownText from './MarkdownText';
import { generateWhatsAppLink, detectPositiveIntent } from '../services/whatsapp';
import { MessageCircle, Lock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatInterfaceProps {
  state: ChatState;
  settings: AdminSettings;
  onSend: (text: string) => void;
  onNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, settings, onSend, onNewChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Lógica de créditos
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.role === 'admin' ? 9999 : (profile?.plan_id ? 50 : (settings.freeMonthlyLimit || 3));
  const hasCredits = creditsUsed < creditsLimit;

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
    <div className="flex flex-col h-full relative">
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

        {!hasCredits && (
          <div className="bg-[#1A2333] border border-champagne/30 rounded-3xl p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-champagne" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Créditos esgotados</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Você atingiu seu limite mensal de consultas gratuitas. Assine um plano para continuar sua análise estratégica.
              </p>
            </div>
            <button 
              onClick={() => navigate('/planos')}
              className="bg-champagne text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4" /> Ver Planos Disponíveis
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-72 right-0 p-4 bg-gradient-to-t from-[#0B1120] to-transparent">
        <div className={cn("transition-opacity duration-300", !hasCredits ? "opacity-20 pointer-events-none" : "opacity-100")}>
          <InputBar 
            onSend={onSend} 
            isThinking={state.isThinking} 
            placeholder={hasCredits ? "Descreva seu caso..." : "Assine para continuar..."}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;