"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
  last_activity: string;
  is_admin: boolean;
}

export interface UserStats {
  total: number;
  subscribers: number;
  admins: number;
}

export const useUsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, subscribers: 0, admins: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca perfis com informações de planos
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*, plans(name, monthly_limit)')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const { data: adminSettings } = await supabase.from('admin_settings').select('free_monthly_limit').limit(1).single();

      const formattedUsers: UserProfile[] = data.map(u => ({
        id: u.id,
        name: `${u.first_name || 'Usuário'} ${u.last_name || ''}`,
        email: '---', 
        whatsapp: u.whatsapp || '---',
        plan: u.plans?.name || 'FREE',
        credits_used: u.credits_used || 0,
        credits_limit: u.plans?.monthly_limit || adminSettings?.free_monthly_limit || 3,
        last_activity: new Date(u.updated_at).toLocaleDateString('pt-BR'),
        is_admin: u.role === 'admin'
      }));

      setUsers(formattedUsers);
      setStats({
        total: formattedUsers.length,
        subscribers: formattedUsers.filter(u => u.plan !== 'FREE').length,
        admins: formattedUsers.filter(u => u.is_admin).length
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { users, stats, isLoading, error, refresh: fetchData };
};