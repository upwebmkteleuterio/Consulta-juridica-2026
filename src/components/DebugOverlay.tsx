"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const DebugOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<any>({});

  const refreshLogs = async () => {
    const { data: session } = await supabase.auth.getSession();
    
    const debugData = {
      timestamp: new Date().toISOString(),
      env_v2: {
        VITE_GEMINI_KEY_EXISTS: !!import.meta.env.VITE_GEMINI_API_KEY,
        VITE_GEMINI_KEY_START: import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 5) + "...",
        MODE: import.meta.env.MODE,
      },
      supabase_status: {
        has_session: !!session?.session,
        user_id: session?.session?.user?.id || 'none',
      },
      browser: navigator.userAgent
    };
    setLogs(debugData);
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-2xl animate-pulse hover:scale-110 transition-all"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md p-6 flex items-center justify-center">
      <div className="bg-[#111827] border border-red-500/30 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <h2 className="text-xl font-bold text-white">Diagnosticador de Erros</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copiado!" : "Copiar Logs Brutos"}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white p-2">
              Fechar
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4">
          <div className="space-y-2">
            <p className="text-red-400 font-bold uppercase tracking-widest text-[10px]">Estado das Variáveis (Vite)</p>
            <pre className="bg-black/40 p-4 rounded-xl text-green-400 border border-white/5">
              {JSON.stringify(logs.env_v2, null, 2)}
            </pre>
          </div>
          
          <div className="space-y-2">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Conexão Supabase</p>
            <pre className="bg-black/40 p-4 rounded-xl text-blue-300 border border-white/5">
              {JSON.stringify(logs.supabase_status, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 leading-relaxed">
            <strong>Dica de Especialista:</strong> Se <code>VITE_GEMINI_KEY_EXISTS</code> for <code>false</code>, o sistema nunca vai falar com a IA. Você precisa criar um arquivo <code>.env</code> na raiz do projeto com o nome da variável igual ao que o código espera.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;