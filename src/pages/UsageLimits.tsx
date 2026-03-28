"use client";

import React, { useState } from 'react';
import { ShieldCheck, User, Crown, Save, MessageSquare, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePlans } from '../hooks/usePlans';

const UsageLimits = () => {
  const { plans } = usePlans();
  
  // Estados locais preparados para integração com banco de dados
  const [adminLimit, setAdminLimit] = useState('999');
  const [freeLimit, setFreeLimit] = useState('3');
  
  // Simulando limites para os planos Pro (isso viria do banco)
  const [proLimits, setProLimits] = useState<Record<string, string>>(
    Object.fromEntries(plans.map(p => [p.id, '50']))
  );

  const handleProLimitChange = (id: string, value: string) => {
    setProLimits(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-champagne" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Limites de Uso</h1>
          </div>
          <p className="text-sm text-gray-500">Controle quanto cada tipo de usuário pode utilizar da IA Jurídica.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00A86B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all">
          <Save className="w-4 h-4" />
          Salvar Configurações
        </button>
      </div>

      <div className="space-y-6">
        {/* Card Administrador */}
        <div className="bg-white border-l-4 border-yellow-400 rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-yellow-50 p-4 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Limites do Administrador</h2>
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Créditos para sua conta admin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Consultas IA Jurídica (Mensal)</label>
                <input 
                  type="number"
                  value={adminLimit}
                  onChange={(e) => setAdminLimit(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Gratuito */}
        <div className="bg-white border-l-4 border-blue-400 rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-blue-50 p-4 rounded-2xl">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Limites Gratuitos (Usuários Logados)</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Usuário logado s/ assinatura</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Consultas IA Jurídica (Mensal)</label>
                <input 
                  type="number"
                  value={freeLimit}
                  onChange={(e) => setFreeLimit(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Planos PRO */}
        <div className="pt-8 space-y-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-champagne" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Planos Pro</h2>
          </div>

          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border-l-4 border-champagne rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start animate-in slide-in-from-bottom-2">
              <div className="bg-yellow-50 p-4 rounded-2xl">
                <Crown className="w-8 h-8 text-champagne" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xs font-bold text-champagne">R$ {plan.price}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Info className="w-3 h-3" />
                    Configuração Individual
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Consultas IA Jurídica (Mensal)</label>
                    <input 
                      type="number"
                      value={proLimits[plan.id] || ''}
                      onChange={(e) => handleProLimitChange(plan.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsageLimits;