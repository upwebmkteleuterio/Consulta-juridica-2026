"use client";

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';

interface TopbarProps {
  onOpenSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onOpenSidebar }) => {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    switch(location.pathname) {
      case '/chat': return 'Consulta Jurídica';
      case '/minha-conta': return 'Minha Conta';
      case '/planos': return 'Planos';
      case '/adm/usuarios': return 'Gestão de Usuários';
      case '/adm/planos': return 'Gestão de Planos';
      case '/adm/limites': return 'Limites de Uso';
      case '/adm/configuracoes': return 'Configurações da IA';
      default: return 'Início';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center px-6 md:px-10 fixed top-0 right-0 left-0 md:left-72 z-40 transition-all">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 font-medium hidden sm:inline">Plataforma</span>
          <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:inline" />
          <span className="text-gray-900 font-bold">{getBreadcrumb()}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;