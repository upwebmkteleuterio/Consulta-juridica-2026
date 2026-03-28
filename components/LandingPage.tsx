
import React from 'react';
/* Fixed: removed OFFICE_INFO which was not exported from constants.ts and not used in this file */
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';

interface LandingPageProps {
  onStartChat: (text: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl w-full space-y-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-center mb-6">
          <img 
            src={FIRM_LOGO} 
            alt="Magalhães & Gomes Logo" 
            className="h-28 md:h-36 object-contain"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Consulta Jurídica <span className="text-champagne">IA</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-xl mx-auto">
            Simplificando a explicação dos seus direitos com a autoridade de quem já atuou em 10.000+ processos.
          </p>
        </div>
      </div>

      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <InputBar 
          onSend={onStartChat} 
          placeholder="Por favor, descreva em detalhes o problema que você está enfrentando..."
        />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left opacity-70">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-champagne font-bold mb-2 uppercase text-xs tracking-widest">Excelência</h3>
          <p className="text-sm text-gray-400">Time de advogados com mais de 10 anos de mercado no Rio de Janeiro.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-champagne font-bold mb-2 uppercase text-xs tracking-widest">Experiência</h3>
          <p className="text-sm text-gray-400">Atuação em mais de 10.000 processos em todo o território nacional.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-champagne font-bold mb-2 uppercase text-xs tracking-widest">Presença</h3>
          <p className="text-sm text-gray-400">Unidades em Rio, Niterói, Angra, Resende e principais cidades do RJ.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
