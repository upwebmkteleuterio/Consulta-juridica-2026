"use client";

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  MessageCircle,
  Clock,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { usePlans } from '../hooks/usePlans';

const MyAccount = () => {
  const { user, profile } = useAuth();
  const { orders, isLoading: loadingOrders } = useOrders();
  const { plans } = usePlans();
  const navigate = useNavigate();

  const currentPlan = plans.find(p => p.id === profile?.plan_id);
  const supportLink = `https://wa.me/5524999984056?text=${encodeURIComponent("Olá, vim da Consulta Jurídica e gostaria de suporte.")}`;

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-xl">
            <User className="w-5 h-5 text-champagne" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        </div>
        <p className="text-sm text-gray-500">Gerencie seu plano e visualize seu histórico de pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo - Plano e Suporte */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card de Plano Atual */}
          <div className="bg-white border-l-4 border-champagne rounded-3xl shadow-sm p-8 border border-gray-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-[10px] font-bold text-champagne uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                Plano Atual
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                profile?.plan_id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              )}>
                {profile?.plan_id ? 'Assinante Pro' : 'Plano Gratuito'}
              </span>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {currentPlan ? currentPlan.name : 'Acesso Gratuito'}
              </h2>
              
              <button 
                onClick={() => navigate('/planos')}
                className="w-full bg-champagne text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-lg shadow-champagne/10"
              >
                {profile?.plan_id ? 'Mudar de Plano' : 'Assinar Plano Pro'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card de Suporte */}
          <div className="bg-[#1A2333] rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Zap className="w-24 h-24" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-bold">Precisa de Ajuda?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nossos especialistas estão prontos para tirar suas dúvidas sobre o sistema.
              </p>
            </div>

            <a 
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all relative z-10"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              Falar com Suporte
            </a>
          </div>
        </div>

        {/* Lado Direito - Histórico */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-gray-900 mb-2">
            <Clock className="w-4 h-4 text-champagne" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Histórico de Cobrança</h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 min-h-[400px] shadow-sm">
            {loadingOrders ? (
              <div className="h-full flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-champagne/20" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                        <CreditCard className="w-4 h-4 text-champagne" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{order.plan_name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">R$ {order.amount}</p>
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">Aprovado</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-100">
                  <CreditCard className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Nenhum pagamento registrado</h4>
                  <p className="text-xs text-gray-400 max-w-[240px] mx-auto mt-1">
                    Suas cobranças e notas fiscais de planos PRO aparecerão listadas aqui.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyAccount;