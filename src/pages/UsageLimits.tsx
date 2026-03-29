"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Crown, Save, Loader2, Info, Settings } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { usePlans } from '../hooks/usePlans';

const UsageLimits = () => {
  const { plans, updatePlan, saveAll: savePlans, isSaving: isSavingPlans } = usePlans();
  const [freeLimit, setFreeLimit] = useState(3);
  const [adminLimit, setAdminLimit] = useState(9999);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('free_monthly_limit, admin_monthly_limit').limit(1).single();
      if (data) {
        setFreeLimit(data.free_monthly_limit || 3);
        setAdminLimit(data.admin_monthly_limit || 9999);
      }
      setIsLoading(false);
    };
    fetchAdminSettings();
  }, []);

  const handleSaveAll = async () => {
    setIsSavingAdmin(true);
    try {
      const { data: settings } = await supabase.from('admin_settings').select('id').limit(1).single();
      if (settings) {
        await supabase.from('admin_settings').update({ 
          free_monthly_limit: freeLimit,
          admin_monthly_limit: adminLimit
        }).eq('id', settings.id);
      }
      
      await savePlans();
      alert("Configurações de limites salvas com sucesso!");
    } catch (err) {
      alert("Erro ao salvar limites.");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500">Carregando limites...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
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
        <button 
          onClick={handleSaveAll}
          disabled={isSavingAdmin || isSavingPlans}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
        >
          {isSavingAdmin || isSavingPlans ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configurações
        </button>
      </div>

      <div className="space-y-6">
        {/* Card Administradores */}
        <div className="bg-white border-l-4 border-red-500 rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-red-50 p-4 rounded-2xl">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Limites para Administradores</h2>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Contas com cargo Admin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Consultas IA Jurídica (Mensal)</label>
                <input 
                  type="number"
                  value={adminLimit}
                  onChange={(e) => setAdminLimit(parseInt(e.target.value) || 0)}
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
                  onChange={(e) => setFreeLimit(parseInt(e.target.value) || 0)}
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
            <div key={plan.id} className="bg-white border-l-4 border-champagne rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
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
                      value={plan.monthly_limit}
                      onChange={(e) => updatePlan(plan.id, { monthly_limit: parseInt(e.target.value) || 0 })}
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