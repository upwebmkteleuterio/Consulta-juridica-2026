"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Copy, X, Check } from 'lucide-react';

const DebugPanel = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Interceptar console.log e console.error para o painel
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      if (args[0]?.toString().startsWith("DEBUG")) {
        setLogs(prev => [...prev, args.join(' ')].slice(-20));
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`].slice(-20));
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-2xl animate-pulse"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 max-h-[400px] bg-black border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-red-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Debug Console</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-2 bg-black/90">
        {logs.length === 0 ? (
          <p className="text-gray-600 italic">Nenhum log capturado ainda...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={log.includes('[ERROR]') ? 'text-red-400' : 'text-green-400'}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel;