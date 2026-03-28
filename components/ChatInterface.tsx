
import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatState, AdminSettings } from '../types';
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';
import MarkdownText from './MarkdownText';
import { generateWhatsAppLink, detectPositiveIntent } from '../services/whatsapp';
import { MessageCircle, ExternalLink, CheckCircle2, HelpCircle } from 'lucide-react';
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
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Efeito para scroll
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: state.isThinking ? 'auto' : 'smooth'
      });
    }
  }, [state.messages, state.isThinking]);

  // Lógica para detectar CTA e intenção positiva
  useEffect(() => {
    const messages = state.messages;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.role === 'model' && !state.isThinking) {
      const contentLower = lastMessage.content.toLowerCase();
      
      // Detecção de CTA (IA oferecendo contato)
      const hasCTA = contentLower.includes("gostaria de falar") || 
                     contentLower.includes("especialista") || 
                     contentLower.includes("nossa equipe") ||
                     contentLower.includes("início à estratégia");

      // Detecção de Aceite (Usuário confirmando contato)
      const prevUserMsg = messages[messages.length - 2];
      const userAccepted = prevUserMsg && prevUserMsg.role === 'user' && detectPositiveIntent(prevUserMsg.content);

      // Se o usuário aceitou, geramos o link imediatamente
      if (userAccepted || contentLower.includes("botão de conexão")) {
        handleGenerateWhatsAppAction();
        setShowRecommendations(false);
      } else {
        // Se a IA ofereceu mas o usuário ainda não aceitou, mostramos as pílulas
        setShowRecommendations(hasCTA && !whatsappLink);
      }
    } else {
      setShowRecommendations(false);
    }
  }, [state.messages, state.isThinking, whatsappLink]);

  const handleGenerateWhatsAppAction = () => {
    if (whatsappLink || !settings) return;
    try {
      const link = generateWhatsAppLink(state.messages, settings.whatsappNumber);
      setWhatsappLink(link);
    } catch (err) {
      console.error("Erro ao gerar link whatsapp", err);
    }
  };

  const handleRecommendationClick = (text: string) => {
    onSend(text);
    setShowRecommendations(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0B1120]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0B1120]/90 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <img src={FIRM_LOGO} alt="Logo" className="h-10 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-white leading-none">Consulta Jurídica IA</h1>
            <p className="text-xs text-champagne font-bold mt-1 uppercase tracking-wider">{settings.officeName}</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold transition-all shadow-lg active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nova Consulta
        </button>
      </header>

      {/* Messages */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-10 scrollbar-hide max-w-4xl mx-auto w-full pt-10 pb-[28rem]"
      >
        {state.messages.map((msg, idx) => {
          const isLastMessage = idx === state.messages.length - 1;
          const showWhatsAppButton = isLastMessage && msg.role === 'model' && whatsappLink;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div 
                className={cn(
                  "max-w-[92%] rounded-2xl p-5 md:p-6 shadow-2xl transition-all duration-300",
                  msg.role === 'user' 
                    ? 'bg-champagne text-white' 
                    : 'bg-[#1A2333] border border-gray-800 text-gray-100'
                )}
              >
                <MarkdownText content={msg.content} />
                
                {showWhatsAppButton && (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-in zoom-in duration-300">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 text-center">Conexão Segura com Especialista</p>
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 text-center"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar com Advogado pelo WhatsApp
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {state.isThinking && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-[#1A2333]/50 border border-gray-800/50 rounded-2xl px-5 py-4 flex gap-3 items-center">
              <span className="text-sm font-medium text-champagne tracking-wide">Analisando estrategicamente</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-champagne rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-champagne rounded-full animate-bounce delay-200"></div>
                <div className="w-1.5 h-1.5 bg-champagne rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Interface Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-transparent pt-32 pointer-events-none z-30">
        <div className="max-w-4xl mx-auto w-full px-4 pointer-events-auto">
          
          {/* Recommendation Buttons (Pills) */}
          {showRecommendations && (
            <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => handleRecommendationClick("Sim, gostaria de falar com um de seus advogados agora.")}
                className="flex items-center gap-2 bg-champagne/10 border border-champagne/30 hover:bg-champagne/20 text-champagne text-xs font-bold py-2.5 px-4 rounded-full transition-all backdrop-blur-md shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                SIM, QUERO FALAR AGORA
              </button>
              <button
                onClick={() => handleRecommendationClick("Quais documentos eu preciso separar para iniciar o processo?")}
                className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2.5 px-4 rounded-full transition-all backdrop-blur-md shadow-xl"
              >
                <HelpCircle className="w-4 h-4" />
                DÚVIDA SOBRE DOCUMENTOS
              </button>
            </div>
          )}

          <InputBar onSend={(text) => {
            setWhatsappLink(null);
            onSend(text);
          }} isThinking={state.isThinking} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
