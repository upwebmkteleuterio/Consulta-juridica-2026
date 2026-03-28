
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

/**
 * Hook preparado para buscar dados reais do Supabase futuramente.
 * Por enquanto, retorna dados mockados conforme o layout solicitado.
 */
export const useUsersManagement = () => {
  // Mock de estatísticas
  const stats: UserStats = {
    total: 115,
    subscribers: 1,
    admins: 2
  };

  // Mock de usuários
  const users: UserProfile[] = [
    { 
      id: '1', 
      name: 'Bruna Cristina', 
      email: 'felicianobruna87@gmail.com', 
      whatsapp: '24981036820', 
      plan: 'FREE', 
      last_activity: '28/03/2026',
      is_admin: false
    },
    { 
      id: '2', 
      name: 'Roberta Santoro de Oliveira Souza', 
      email: 'santoro.roberta@gmail.com', 
      whatsapp: '21988631593', 
      plan: 'FREE', 
      last_activity: '28/03/2026',
      is_admin: false
    },
    { 
      id: '3', 
      name: 'Sabrine Andressa Vieira Neves', 
      email: 'sabrineavneves@gmail.com', 
      whatsapp: '21968389229', 
      plan: 'FREE', 
      last_activity: '28/03/2026',
      is_admin: false
    },
    { 
      id: '4', 
      name: 'Bruno Gomes', 
      email: 'concursos.bruno2@gmail.com', 
      whatsapp: '21964088544', 
      plan: 'FREE', 
      last_activity: '28/03/2026',
      is_admin: false
    },
    { 
      id: '5', 
      name: 'Weverton Silva', 
      email: 'wevertonesophia@gmail.com', 
      whatsapp: '21994667569', 
      plan: 'FREE', 
      last_activity: '28/03/2026',
      is_admin: false
    },
  ];

  return {
    users,
    stats,
    isLoading: false,
    error: null
  };
};
