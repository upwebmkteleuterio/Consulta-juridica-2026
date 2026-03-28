import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { Save, ArrowLeft, LogOut } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminPageProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, onBack }) => {
  const [formData, setFormData] = useState<AdminSettings>(settings);
  const navigate = useNavigate();

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400"><ArrowLeft /> Voltar</button>
          <button onClick={handleSave} className="bg-champagne px-6 py-2 rounded-xl font-bold flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl space-y-4">
            <h2 className="text-champagne font-bold uppercase text-xs">Dados do Escritório</h2>
            <input value={formData.officeName} onChange={e => setFormData({...formData, officeName: e.target.value})} className="w-full bg-transparent border border-gray-800 p-3 rounded-lg" placeholder="Nome" />
            <input value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full bg-transparent border border-gray-800 p-3 rounded-lg" placeholder="WhatsApp" />
          </div>
          <div className="bg-white/5 p-6 rounded-2xl space-y-4">
            <h2 className="text-red-400 font-bold uppercase text-xs">Cérebro da IA</h2>
            <textarea rows={4} value={formData.internalInstructions} onChange={e => setFormData({...formData, internalInstructions: e.target.value})} className="w-full bg-transparent border border-gray-800 p-3 rounded-lg" placeholder="Instruções" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;