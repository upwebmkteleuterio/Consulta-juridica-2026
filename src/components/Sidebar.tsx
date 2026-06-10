"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  User, 
  CreditCard, 
  LogOut, 
  Users,
  Settings,
  ShieldCheck,
  Gavel,
  Sliders,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { DEFAULT_ADMIN_SETTINGS } from '../constants';
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [limits, setLimits] = useState({ 
    free: DEFAULT_ADMIN_SETTINGS.freeMonthlyLimit, 
    admin: DEFAULT_ADMIN_SETTINGS.adminMonthlyLimit 
  });

  useEffect(() => {
    const fetchLimits = async () => {
      const { data } = await supabase.from('admin_settings').select('free_monthly_limit, admin_monthly_limit').limit(1).single();
      if (data) {
        setLimits({ 
          free: typeof data.free_monthly_limit === 'number' ? data.free_monthly_limit : 3, 
          admin: typeof data.admin_monthly_limit === 'number' ? data.admin_monthly_limit : 9999 
        });
      }
    };
    fetchLimits();
  }, [profile?.credits_used, profile?.total_purchased_credits]); 

  const mainMenu = [
    { id: 'home', label: 'Consulta Jurídica', icon: MessageSquare, path: '/' },
    { id: 'account', label: 'Minha conta', icon: User, path: '/minha-conta' },
    { id: 'plans', label: 'Assinar Plano', icon: CreditCard, path: '/planos' },
  ];

  const adminMenu = [
    { id: 'users', label: 'Usuários', icon: Users, path: '/adm/usuarios' },
    { id: 'plans-mgmt', label: 'Gestão de Planos', icon: Settings, path: '/adm/planos' },
    { id: 'limits', label: 'Limites de Uso', icon: ShieldCheck, path: '/adm/limites' },
    { id: 'config', label: 'Cérebro da IA', icon: Sliders, path: '/adm/configuracoes' },
  ];

  // Cálculo de limites globais + créditos comprados acumulativos
  const totalLimit = profile?.role === 'admin' 
    ? limits.admin 
    : (profile?.total_purchased_credits || 0) + limits.free;

  const used = profile?.credits_used || 0;
  const remaining = Math.max(0, totalLimit - used);
  
  // A batinha (barra de progresso) deve descender conforme os créditos acabam (mostra a porcentagem restante)
  const percentage = totalLimit > 0 ? Math.min((remaining / totalLimit) * 100, 100) : 0;
  
  // Vermelha quando faltar 2 ou menos, amarela/champagne no restante, cinza ao zerar
  const barColor = remaining <= 0 
    ? 'bg-gray-800' 
    : (remaining <= 2 ? 'bg-red-500 animate-pulse' : 'bg-champagne');

  const handleNav = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-[70] transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-10 h-10 bg-champagne rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-champagne/20">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Consulta Jurídica</h1>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
          <nav className="space-y-8">
            <div className="space-y-1">
              {mainMenu.map((item) => {
                const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname === '/');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                      isActive ? "bg-yellow-50/50 text-[#0B1120]" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-champagne" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ADM</p>
                <div className="space-y-1">
                  {adminMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                          isActive ? "bg-yellow-50/50 text-[#0B1120]" : "text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", isActive ? "text-champagne" : "text-gray-400")} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {user && (
            <div className="bg-[#0B1120] rounded-2xl p-5 text-white space-y-4 shadow-lg mx-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Seus Créditos</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded text-white font-bold",
                  isAdmin ? "bg-red-500" : "bg-champagne"
                )}>
                  {isAdmin ? 'Admin' : ((profile?.total_purchased_credits || 0) > 0 ? 'Recarga' : 'Grátis')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-gray-300">Uso da IA</span>
                  <span className="text-xs font-bold">{used} de {totalLimit}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-500", barColor)} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-champagne font-bold">
                  {profile?.first_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                    {profile?.first_name || 'Usuário'}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>
              <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => handleNav('/login')} className="w-full flex items-center justify-center py-4 bg-champagne text-[#0B1120] rounded-xl text-sm font-bold hover:brightness-105 transition-all">
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;