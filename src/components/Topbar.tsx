"use client";

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    switch(location.pathname) {
      case '/chat': return 'Consulta Jurídica';
      case '/minha-conta': return 'Minha Conta';
      case '/planos': return 'Planos';
      case '/adm': return 'Administração';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center px-10 fixed top-0 right-0 left-72 z-40">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 font-medium">Plataforma</span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="text-gray-900 font-bold">{getBreadcrumb()}</span>
      </div>
    </header>
  );
};

export default Topbar;