"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Apenas as telas de CHAT e HOME (Consulta) devem ter fundo escuro.
  // Todas as outras (ADM, Minha Conta, Planos) devem ter fundo claro.
  const isDarkContent = location.pathname === '/' || location.pathname === '/chat';

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Barra Lateral Fixa */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className={cn(
        "flex-1 ml-72 flex flex-col min-h-screen transition-colors duration-300",
        isDarkContent ? "bg-[#0B1120]" : "bg-[#F8FAFC]"
      )}>
        {/* Barra Superior Fixa */}
        <Topbar />

        {/* Conteúdo da Página */}
        <main className="mt-20 flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
