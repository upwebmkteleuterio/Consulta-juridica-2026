"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

const UsageLimits = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [freeLimit, setFreeLimit] = useState<number>(0);
  const [adminLimit, setAdminLimit] = useState<number>(9999);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('free_monthly_limit, admin_monthly_limit')
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          // Garante que o valor numérico zero seja lido corretamente e não caia em fallback de segurança
          setFreeLimit(typeof data.free_monthly_limit === 'number' ? data.free_monthly_limit : 3);
          setAdminLimit(typeof data.admin_monthly_limit === 'number' ? data.admin_monthly_limit : 9999);
        }
      } catch (error) {
        toast.error('Erro ao carregar os limites de uso');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: current, error: fetchError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (current) {
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({
            free_monthly_limit: freeLimit,
            admin_monthly_limit: adminLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', current.id);

        if (updateError) throw updateError;
        
        toast.success('Limites de uso atualizados com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar os limites de uso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#0B1120] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-champagne animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <div className="p-3 bg-yellow-50/5 border border-yellow-50/10 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-champagne" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Limites de Uso</h1>
          <p className="text-gray-400 text-sm">Configure a quantidade de créditos e limites do sistema</p>
        </div>
      </div>

      <div className="bg-[#1A2333]/80 border border-gray-800 rounded-[32px] p-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              Limites Gratuitos (Usuários Logados)
            </label>
            <input
              type="number"
              min="0"
              value={freeLimit}
              onChange={(e) => setFreeLimit(parseInt(e.target.value) || 0)}
              className="w-full bg-[#0B1120] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-champagne/50"
              placeholder="Ex: 0"
            />
            <p className="text-xs text-gray-500 mt-2">
              Quantos créditos um usuário que acabou de se cadastrar (Plano Gratuito) terá de limite mensal padrão. Coloque 0 para travar o uso imediato e exigir recarga.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              Limites de Administradores
            </label>
            <input
              type="number"
              min="1"
              value={adminLimit}
              onChange={(e) => setAdminLimit(parseInt(e.target.value) || 9999)}
              className="w-full bg-[#0B1120] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-champagne/50"
              placeholder="Ex: 9999"
            />
            <p className="text-xs text-gray-500 mt-2">
              Quantidade de créditos para as contas com função de Administrador (ADM).
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800/50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white hover:bg-champagne text-[#0B1120] px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center gap-3 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageLimits;