"use client";

import React from 'react';
import { usePlans } from '../hooks/usePlans';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

const SubscribePlan = () => {
  const { plans } = usePlans();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>, baseLink: string) => {
    // Se não estiver logado, cancela o clique e joga pro login
    if (!user) {
      e.preventDefault();
      navigate('/login');
      return;
    }
  };

  const getCheckoutUrl = (baseLink: string) => {
    if (!baseLink) return '#';
    const cleanLink = baseLink.trim();
    
    // Se não houver usuário logado (redundância de segurança), retorna o link limpo
    if (!user) return cleanLink;
    
    const params = new URLSearchParams();
    
    // E-mail do usuário (Sessão Supabase)
    if (user.email) {
      params.set('email', user.email);
    }
    
    // Nome do perfil (Tabela Profiles)
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    if (fullName) {
      params.set('name', fullName);
    }
    
    // Telefone (Tabela Profiles) - Adicionando 55 como padrão Brasil
    if (profile?.whatsapp) {
      const digitsOnly = profile.whatsapp.replace(/\D/g, '');
      if (digitsOnly) {
        // Se o usuário já não digitou o 55, nós adicionamos
        const phoneWithCountry = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;
        params.set('phone', phoneWithCountry);
      }
    }

    const queryString = params.toString();
    if (!queryString) return cleanLink;

    const separator = cleanLink.includes('?') ? '&' : '?';
    return `${cleanLink}${separator}${queryString}`;
  };

  return (
    <div className="min-h-full bg-[#0B1120] text-white overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-champagne/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 space-y-20">
        {/* Header */}
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-yellow-50/5 border border-yellow-50/10 px-4 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-champagne" />
            <span className="text-[10px] font-black uppercase tracking-widest text-champagne">Planos e Assinaturas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
            Planos de <span className="text-champagne">Consulta Jurídica</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tire suas dúvidas jurídicas instantaneamente com nossa IA especializada e receba orientação estratégica no WhatsApp.
          </p>
        </div>

        {/* Grid de Planos */}
        <div className="flex justify-center gap-8 flex-wrap">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="w-full max-w-[380px] bg-[#1A2333]/80 border border-gray-800 rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl relative group hover:border-champagne/30 transition-all duration-500"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-champagne text-[#0B1120] px-4 py-1 rounded-full text-[10px] font-black uppercase">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white pr-10 leading-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ {plan.price}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {plan.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <a 
                href={getCheckoutUrl(plan.checkout_link)}
                target={user ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={(e) => handleCheckoutClick(e, plan.checkout_link)}
                className="w-full bg-white text-[#0B1120] py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-champagne transition-all shadow-xl"
              >
                Assinar Agora
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          ))}
        </div>

        {/* Footer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-gray-800/50">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-yellow-50/5 rounded-3xl">
              <ShieldCheck className="w-8 h-8 text-champagne" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Pagamento Seguro</h4>
              <p className="text-xs text-gray-500">Processado via Cakto</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-yellow-50/5 rounded-3xl">
              <Zap className="w-8 h-8 text-champagne" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Acesso Imediato</h4>
              <p className="text-xs text-gray-500">Liberação após aprovação</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-yellow-50/5 rounded-3xl">
              <MessageSquare className="w-8 h-8 text-champagne" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Suporte Jurídico</h4>
              <p className="text-xs text-gray-500">Especialistas prontos para agir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribePlan;