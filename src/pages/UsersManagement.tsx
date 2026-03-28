"use client";

import React, { useState } from 'react';
import { Search, Users, Crown, RefreshCw, Calendar, Phone, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUsersManagement } from '../hooks/useUsersManagement';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, stats, isLoading } = useUsersManagement();

  const statCards = [
    { label: 'TOTAL', value: stats.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'ASSINANTES', value: stats.subscribers, icon: Crown, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'ADMINS', value: stats.admins, icon: RefreshCw, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>
          </div>
          <p className="text-gray-500">Controle e visualize todos os clientes da plataforma.</p>
        </div>

        <div className="flex gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm min-w-[140px]">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 pl-12 shadow-sm focus:border-champagne outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-champagne transition-all">
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informações do Usuário</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plano Ativo</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Atividade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                      {u.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{u.name}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {u.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-300" /> {u.whatsapp}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2 w-fit",
                    u.plan === 'PRO' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {u.plan === 'PRO' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {u.plan}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Última Atividade</span>
                    <span className="text-sm text-gray-900 font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-300" /> {u.last_activity}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;
