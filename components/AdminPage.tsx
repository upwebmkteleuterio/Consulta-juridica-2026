
import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { Save, ArrowLeft, ShieldAlert, FileText, MapPin, UserCheck, Ban, Phone, BrainCircuit, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AdminPageProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, onBack }) => {
  const [formData, setFormData] = useState<AdminSettings>(settings);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Configurações da IA</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-champagne text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? "Salvando..." : "Salvar no Banco"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-2 text-champagne border-b border-white/10 pb-3">
              <FileText className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider">Dados do Escritório</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Escritório</label>
                <input
                  name="officeName"
                  value={formData.officeName}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-champagne transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp (Apenas Números)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 pl-10 text-sm focus:border-champagne transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Descrição Institucional</label>
                <textarea
                  name="officeDescription"
                  rows={3}
                  value={formData.officeDescription}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-champagne transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                  <UserCheck className="w-3 h-3" /> Sócios e Expertise
                </div>
                <textarea
                  name="foundersInfo"
                  rows={2}
                  value={formData.foundersInfo}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-champagne transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-2 text-red-400 border-b border-white/10 pb-3">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider">Cérebro da IA</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                   <BrainCircuit className="w-3 h-3 text-blue-400" /> Instruções Internas
                </div>
                <textarea
                  name="internalInstructions"
                  rows={3}
                  value={formData.internalInstructions}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Malícia Estratégica</label>
                <textarea
                  name="malicePrompt"
                  rows={4}
                  value={formData.malicePrompt}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-red-500/50 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                  <Ban className="w-3 h-3" /> Prompt Negativo
                </div>
                <textarea
                  name="negativePrompt"
                  rows={3}
                  value={formData.negativePrompt}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-lg p-3 text-sm focus:border-gray-500 transition-colors resize-none"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
