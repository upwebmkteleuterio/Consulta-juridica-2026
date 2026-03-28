"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  User, 
  CreditCard, 
  LogOut, 
  LogIn, 
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { FIRM_LOGO } from '../constants';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'chat', label: 'Consulta Jurídica', icon: MessageSquare, path: '/chat' },
    { id: 'account', label: 'Minha conta', icon: User, path: '/minha-conta' },
    { id: 'plans', label: 'Assinar Plano', icon: CreditCard, path: '/planos' },
  ];

  // Mock de créditos para UI (será integrado via Supabase depois)
  const credits = {
    total: 10,
    used: 3,
    plan: 'Grátis'
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-8">
        <img 
          src={FIRM_LOGO} 
          alt="Magalhães & Gomes" 
          className="h-16 w-auto cursor-pointer" 
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive 
                  ? "bg-gray-50 text-[#0B1120] shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-champagne" : "text-gray-400")} />
              {item.label}
            </button>
          );
        })}
        
        {/* Link para Admin se logado (Opcional dependendo da regra de negócio) */}
        {user && (
          <button
            onClick={() => navigate('/adm')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50"
          >
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            Painel Administrativo
          </button>
        )}
      </nav>

      {/* Credit Panel */}
      <div className="px-6 py-6 border-t border-gray-100">
        <div className="bg-[#0B1120] rounded-2xl p-5 text-white space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Seus créditos / Mês</span>
            <span className="text-[10px] px-2 py-0.5 bg-champagne rounded text-white font-bold">{credits.plan}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-medium text-gray-300">Conversas com IA Jurídica</span>
              <span className="text-xs font-bold">{credits.used}/{credits.total}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-champagne transition-all duration-500" 
                style={{ width: `${(credits.used / credits.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Footer Section */}
      <div className="p-6 border-t border-gray-100">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-champagne font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                  {user.user_metadata.first_name || 'Usuário'}
                </span>
                <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B1120] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button 
              onClick={() => navigate('/cadastro')}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Cadastre-se
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;