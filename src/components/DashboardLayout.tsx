"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Barra Lateral Fixa */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 ml-72 flex flex-col bg-[#0B1120]">
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