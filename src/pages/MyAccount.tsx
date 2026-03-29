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
  ExternalLink,
  Zap
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
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-champagne" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Minha Conta</h1>
        </div>
        <p className="text-gray-500 text-lg">Gerencie suas informações e histórico de assinaturas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Lado Esquerdo - Plano e Suporte */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Card de Plano Atual */}
          <div className="bg-white border-l-[6px] border-champagne rounded-[40px] shadow-sm p-10 border border-gray-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2 text-[10px] font-black text-champagne uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Plano Atual
              </div>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {profile?.plan_id ? 'Pro' : 'Gratuito'}
              </span>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-black text-gray-900 leading-none">
                {currentPlan ? currentPlan.name : 'Nenhum Plano'}
              </h2>
              
              <button 
                onClick={() => navigate('/planos')}
                className="w-full bg-champagne text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-champagne/10"
              >
                Ver Planos Disponíveis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Card de Suporte */}
          <div className="bg-[#1A2333] rounded-[40px] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-black leading-tight">Precisa de Ajuda?</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Fale com nosso suporte jurídico para tirar dúvidas sobre seu plano.
              </p>
            </div>

            <a 
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all relative z-10"
            >
              Falar com Suporte
            </a>
          </div>
        </div>

        {/* Lado Direito - Histórico */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 text-gray-900 mb-2">
            <Clock className="w-5 h-5 text-champagne" />
            <h2 className="text-xl font-black uppercase tracking-widest">Histórico de Cobrança</h2>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[40px] p-12 min-h-[500px] flex flex-col items-center justify-center text-center shadow-sm">
            {loadingOrders ? (
              <div className="animate-spin w-10 h-10 border-4 border-champagne border-t-transparent rounded-full" />
            ) : orders.length > 0 ? (
              <div className="w-full space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <CreditCard className="w-6 h-6 text-champagne" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{order.plan_name}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">R$ {order.amount}</p>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Pago</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="text-2xl font-black text-gray-900">Nenhum pagamento registrado</h4>
                <p className="text-gray-400 max-w-xs mx-auto text-lg">
                  Seu histórico de assinaturas PRO aparecerá aqui.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyAccount;