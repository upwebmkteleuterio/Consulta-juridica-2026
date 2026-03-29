"use client";

import { useState, useEffect } from 'react';
import { Plan } from '../types';
import { supabase } from '../integrations/supabase/client';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setPlans(data as Plan[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const addPlan = () => {
    const newPlan: Plan = {
      id: crypto.randomUUID(),
      name: 'Novo Plano',
      badge: '',
      price: '0,00',
      product_id: '',
      checkout_link: '',
      benefits: ['Acesso ilimitado'],
      monthly_limit: 50
    };
    setPlans([...plans, newPlan]);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans(plans.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePlan = async (id: string) => {
    if (id.length > 20) {
      await supabase.from('plans').delete().eq('id', id);
    }
    setPlans(plans.filter(p => p.id !== id));
  };

  const saveAll = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('plans').upsert(
        plans.map(p => ({
          id: p.id,
          name: p.name,
          badge: p.badge,
          price: p.price,
          product_id: p.product_id,
          checkout_link: p.checkout_link,
          benefits: p.benefits,
          monthly_limit: p.monthly_limit,
          updated_at: new Date().toISOString()
        }))
      );
      if (error) throw error;
      await fetchPlans();
    } catch (err) {
      console.error("Erro ao salvar planos:", err);
      alert("Erro ao salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return { plans, isLoading, isSaving, addPlan, updatePlan, removePlan, saveAll, refresh: fetchPlans };
};