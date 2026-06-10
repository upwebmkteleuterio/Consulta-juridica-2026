"use client";

import React from 'react';
import { CreditCard, Save, Plus, Trash2, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import PriceInput from '../components/PriceInput';
import { cn } from '../lib/utils';

const PlansManagement = () => {
  const { plans, isSaving, isLoading, addPlan, updatePlan, removePlan, saveAll } = usePlans();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-champagne" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-champagne" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Configuração de Planos (Cakto)</h1>
          </div>
          <p className="text-sm text-gray-500">Gerencie os preços e links de checkout da Cakto que aparecerão para os usuários.</p>
        </div>
        <button 
          onClick={saveAll}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Tudo
        </button>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border-l-4 border-champagne rounded-2xl shadow-sm overflow-hidden p-8 border border-gray-100 space-y-8 animate-in slide-in-from-bottom-2">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Básico */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-champagne uppercase tracking-widest">
                  <div className="w-4 h-4 bg-champagne/10 rounded flex items-center justify-center">🏷️</div>
                  Básico
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nome do Plano</label>
                    <input 
                      value={plan.name} 
                      onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                      placeholder="Ex: Assinatura Consulta"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Etiqueta (Badge)</label>
                    <input 
                      value={plan.badge || ''} 
                      onChange={(e) => updatePlan(plan.id, { badge: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                      placeholder="Ex: Mais Escolhido"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Preço (R$)</label>
                    <PriceInput 
                      value={plan.price} 
                      onChange={(val) => updatePlan(plan.id, { price: val })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Créditos do Plano</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="0"
                        value={plan.monthly_limit} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updatePlan(plan.id, { monthly_limit: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pr-20 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                        placeholder="Ex: 50"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-xs font-bold">créditos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integração */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  <div className="w-4 h-4 bg-blue-50 rounded flex items-center justify-center">🔗</div>
                  Integração
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">ID do Produto (Cakto)</label>
                      <Info className="w-3 h-3 text-gray-300" />
                    </div>
                    <input 
                      value={plan.product_id || ''} 
                      onChange={(e) => updatePlan(plan.id, { product_id: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Link de Checkout</label>
                    <input 
                      value={plan.checkout_link || ''} 
                      onChange={(e) => updatePlan(plan.id, { checkout_link: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-900 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                    <div className="w-4 h-4 bg-yellow-50 rounded flex items-center justify-center">✅</div>
                    Benefícios
                  </div>
                  <button 
                    onClick={() => updatePlan(plan.id, { benefits: [...plan.benefits, ''] })}
                    className="text-[10px] font-bold text-champagne hover:underline"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <div className="flex-1 relative">
                        <CheckCircle2 className="absolute left-3 top-2.5 w-4 h-4 text-green-500" />
                        <input 
                          value={benefit} 
                          onChange={(e) => {
                            const newBenefits = [...plan.benefits];
                            newBenefits[idx] = e.target.value;
                            updatePlan(plan.id, { benefits: newBenefits });
                          }}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 pl-10 text-xs text-gray-900 focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newBenefits = plan.benefits.filter((_, i) => i !== idx);
                          updatePlan(plan.id, { benefits: newBenefits });
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button 
                onClick={() => removePlan(plan.id)}
                className="flex items-center gap-2 text-red-500 text-xs font-bold hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Plano
              </button>
            </div>
          </div>
        ))}

        {/* Adicionar Novo Plano */}
        <button 
          onClick={addPlan}
          className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-champagne hover:text-champagne transition-all group"
        >
          <div className="p-4 bg-gray-50 rounded-full group-hover:bg-yellow-50 transition-all">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold text-sm uppercase tracking-widest">Adicionar Novo Plano</span>
        </button>
      </div>
    </div>
  );
};

export default PlansManagement;