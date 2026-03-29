"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isDarkContent = location.pathname === '/' || location.pathname === '/chat';

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Barra Lateral com controle de estado para Mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Área de Conteúdo Principal - Margem lateral apenas em desktop */}
      <div className={cn(
        "flex-1 md:ml-72 flex flex-col min-h-screen transition-all duration-300",
        isDarkContent ? "bg-[#0B1120]" : "bg-[#F8FAFC]"
      )}>
        {/* Barra Superior */}
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Conteúdo da Página */}
        <main className="mt-20 flex-1 overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;