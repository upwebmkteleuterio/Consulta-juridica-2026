"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, AlertCircle, Zap, Shield, Server } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const DebugOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<any>({});
  const [session, setSession] = useState<any>(null);

  const refreshLogs = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setLogs((window as any).__GEMINI_DEBUG_LOGS || {});
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const copyToClipboard = () => {
    const debugText = {
      timestamp: new Date().toISOString(),
      session_status: !!session,
      user_id: session?.user?.id,
      logs: logs
    };
    navigator.clipboard.writeText(JSON.stringify(debugText, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all animate-pulse"
        title="Abrir Diagnóstico de IA"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md p-4 md:p-10 flex items-center justify-center overflow-hidden">
      <div className="bg-[#0B1120] border border-red-500/30 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Inspetor de Diagnóstico</h2>
              <p className="text-xs text-gray-500 font-mono">Status da Conexão Gemini 3.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar Logs'}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">Fechar</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          
          {/* Status Quick Check */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sessão</span>
              </div>
              <p className="text-sm font-mono text-white">{session ? 'Autenticado ✅' : 'Não Logado ❌'}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <Server size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Endpoint</span>
              </div>
              <p className="text-sm font-mono text-white truncate">gemini-chat (v1)</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Zap size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Modelo</span>
              </div>
              <p className="text-sm font-mono text-white">Gemini 3 Flash</p>
            </div>
          </div>

          {/* Detailed Logs */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                Última Requisição Enviada
              </h3>
              <pre className="bg-black/50 p-4 rounded-2xl text-[10px] text-yellow-200/80 font-mono border border-white/5 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(logs.lastRequest || "Nenhuma requisição feita ainda.", null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Erro Retornado (Backend/Rede)
              </h3>
              <pre className="bg-red-500/5 p-4 rounded-2xl text-[10px] text-red-400 font-mono border border-red-500/10 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(logs.lastError || "Nenhum erro registrado.", null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Último Chunk do Stream
              </h3>
              <pre className="bg-black/50 p-4 rounded-2xl text-[10px] text-green-400/80 font-mono border border-white/5 overflow-x-auto whitespace-pre-wrap">
                {logs.lastResponse || "Aguardando resposta..."}
              </pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 text-[10px] text-gray-500 flex justify-between items-center rounded-b-[32px]">
          <span>MAGALHÃES & GOMES - DEBUG SYSTEM V2.5</span>
          <span className="font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;