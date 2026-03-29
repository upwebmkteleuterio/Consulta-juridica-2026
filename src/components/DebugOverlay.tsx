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
      env_check: {
        VITE_PREFIX_EXISTS: !!import.meta.env.VITE_GEMINI_API_KEY,
        PROCESS_ENV_EXISTS: !!process.env.GEMINI_API_KEY,
        API_KEY_START: (import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "undefined").substring(0, 5) + "...",
        MODE: import.meta.env.MODE,
      },
      supabase_status: {
        has_session: !!session?.session,
        user_id: session?.session?.user?.id || 'none',
      }
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
        className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-2xl animate-pulse"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md p-6 flex items-center justify-center">
      <div className="bg-[#111827] border border-red-500/30 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <h2 className="text-xl font-bold text-white">Debug de Ambiente</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">Fechar</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200">
            <strong>Instrução:</strong> Se "VITE_PREFIX_EXISTS" e "PROCESS_ENV_EXISTS" forem <code>false</code>, o chat não funcionará. Você precisa criar um arquivo <code>.env</code> local.
          </div>
          <pre className="bg-black/40 p-4 rounded-xl text-green-400 border border-white/5">
            {JSON.stringify(logs.env_check, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;