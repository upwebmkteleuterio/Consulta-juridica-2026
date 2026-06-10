"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Shield, User, Save, Loader2 } from 'lucide-react';

const UsageLimits = () => {
  const [freeLimit, setFreeLimit] = useState(3);
  const [adminLimit, setAdminLimit] = useState(9999);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('free_monthly_limit, admin_monthly_limit')
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          // Usando ?? (nullish coalescing) para que o valor 0 seja considerado válido e não reverta para o padrão
          setFreeLimit(data.free_monthly_limit ?? 3);
          setAdminLimit(data.admin_monthly_limit ?? 9999);
        }
      } catch (err: any) {
        console.error('Erro ao buscar limites:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminSettings();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const { data: settings, error: fetchError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (settings) {
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({ 
            free_monthly_limit: freeLimit,
            admin_monthly_limit: adminLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (updateError) throw updateError;
        setMessage({ type: 'success', text: 'Limites de uso atualizados com sucesso!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar limites.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#C5A059] mb-2">Limites de Uso</h1>
        <p className="text-gray-400">Gerencie os limites de créditos e uso para diferentes tipos de usuários.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Limites de Usuários Free */}
        <div className="bg-[#1A2333] p-6 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-3 text-[#C5A059]">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-medium">Usuários Free</h2>
          </div>
          <p className="text-sm text-gray-400">
            Créditos mensais gratuitos atribuídos automaticamente a novos usuários cadastrados.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Créditos de Entrada (Free)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={freeLimit}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFreeLimit(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-[#0B1120] border border-gray-800 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none focus:border-[#C5A059]"
              />
              <div className="absolute right-3 top-3 text-gray-500 text-sm">créditos</div>
            </div>
          </div>
        </div>

        {/* Limites de Administradores */}
        <div className="bg-[#1A2333] p-6 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-3 text-[#C5A059]">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-medium">Administradores</h2>
          </div>
          <p className="text-sm text-gray-400">
            Limite de créditos para as contas administrativas. Recomendado manter um valor alto.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Créditos de Entrada (Admin)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={adminLimit}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAdminLimit(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-[#0B1120] border border-gray-800 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none focus:border-[#C5A059]"
              />
              <div className="absolute right-3 top-3 text-gray-500 text-sm">créditos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-[#C5A059] text-[#0B1120] px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UsageLimits;