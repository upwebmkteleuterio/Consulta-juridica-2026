"use client";

import React, { useState } from 'react';
import { X, User, Phone, Mail, Lock, Loader2, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, whatsapp: whatsapp }
          }
        });
        if (error) throw error;
        if (!data.session) {
          setError("Cadastro realizado! Por favor, faça login.");
          setActiveTab('login');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 pt-12 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-champagne" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              Crie uma conta ou Entre com a sua para continuar
            </h2>
            <p className="text-gray-400 text-sm">Quase lá, entre para continuar seu atendimento com a IA Jurídica</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('register')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                activeTab === 'register' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <UserPlus className="w-4 h-4" /> Criar Conta
            </button>
            <button 
              onClick={() => setActiveTab('login')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                activeTab === 'login' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LogIn className="w-4 h-4" /> Fazer Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{error}</div>}

            <div className="max-h-[300px] overflow-y-auto px-1 space-y-4 scrollbar-hide">
              {activeTab === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nome *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 text-sm text-gray-900 focus:bg-white focus:border-champagne outline-none" placeholder="João" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Sobrenome *</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 px-4 text-sm text-gray-900 focus:bg-white focus:border-champagne outline-none" placeholder="Silva" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                      <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 text-sm text-gray-900 focus:bg-white focus:border-champagne outline-none" placeholder="(21) 99999-9999" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 text-sm text-gray-900 focus:bg-white focus:border-champagne outline-none" placeholder="seu@email.com" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 text-sm text-gray-900 focus:bg-white focus:border-champagne outline-none" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-champagne text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-champagne/10 hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {activeTab === 'register' ? 'Criar minha conta' : 'Entrar no sistema'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;