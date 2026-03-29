"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  plan: 'FREE' | 'PRO';
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
      // Aqui estamos buscando da tabela profiles recém criada
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedUsers: UserProfile[] = data.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_activity || ''}`,
        email: '---', // Email fica no auth.users, por segurança não vem aqui sem join complexo
        whatsapp: u.whatsapp || '---',
        plan: 'FREE', // Lógica de planos será integrada em breve
        last_activity: new Date(u.updated_at).toLocaleDateString('pt-BR'),
        is_admin: u.role === 'admin'
      }));

      setUsers(formattedUsers);
      setStats({
        total: formattedUsers.length,
        subscribers: 0,
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