"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ChatState, Message, AdminSettings } from './types';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import Modal from './components/Modal';
import { getGeminiStreamResponse } from './services/gemini';
import { DEFAULT_ADMIN_SETTINGS } from './constants';
import { supabase } from './integrations/supabase/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const STORAGE_KEY = 'magalhaes_gomes_chat_history_v2';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isThinking: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .limit(1)
          .single();

        if (data && !error) {
          setAdminSettings({
            officeName: data.office_name,
            officeDescription: data.office_description,
            foundersInfo: data.founders_info,
            addresses: data.addresses,
            malicePrompt: data.malice_prompt,
            negativePrompt: data.negative_prompt,
            whatsappNumber: data.whatsapp_number,
            internalInstructions: data.internal_instructions
          });
        }
      } catch (err) {
        console.warn("Using default settings", err);
      } finally {
        setIsAppReady(true);
      }
    };

    fetchSettings();

    const savedChat = localStorage.getItem(STORAGE_KEY);
    if (savedChat) {
      try {
        const history = JSON.parse(savedChat);
        if (history && history.length > 0) {
          setChatState(prev => ({ ...prev, messages: history }));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (chatState.messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatState.messages));
    }
  }, [chatState.messages]);

  const handleSaveSettings = async (newSettings: AdminSettings) => {
    try {
      const { data: existing } = await supabase.from('admin_settings').select('id').limit(1).single();
      
      const { error } = await supabase
        .from('admin_settings')
        .update({
          office_name: newSettings.officeName,
          office_description: newSettings.officeDescription,
          founders_info: newSettings.foundersInfo,
          addresses: newSettings.addresses,
          malice_prompt: newSettings.malicePrompt,
          negative_prompt: newSettings.negativePrompt,
          whatsapp_number: newSettings.whatsappNumber,
          internal_instructions: newSettings.internalInstructions
        })
        .eq('id', existing?.id);

      if (error) throw error;
      
      setAdminSettings(newSettings);
      alert("Configurações persistidas no Supabase!");
      navigate('/');
    } catch (err) {
      alert("Erro ao salvar no banco de dados.");
      console.error(err);
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMsg], isThinking: true }));
    if (location.pathname !== '/chat') navigate('/chat');

    try {
      const stream = await getGeminiStreamResponse(chatState.messages, text, adminSettings);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: '', timestamp: Date.now() };
      setChatState(prev => ({ ...prev, messages: [...prev.messages, aiMsg], isThinking: false }));

      let fullContent = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullContent += chunk.text;
          setChatState(prev => {
            const newMessages = [...prev.messages];
            const lastIdx = newMessages.length - 1;
            if (lastIdx >= 0) newMessages[lastIdx] = { ...newMessages[lastIdx], content: fullContent };
            return { ...prev, messages: newMessages };
          });
        }
      }
    } catch (error) {
      setChatState(prev => ({
        ...prev, isThinking: false,
        messages: [...prev.messages, { id: Date.now().toString(), role: 'model', content: "Houve um erro na comunicação com a IA Jurídica. Por favor, tente novamente.", timestamp: Date.now() }]
      }));
    }
  }, [chatState.messages, location.pathname, adminSettings, navigate]);

  if (authLoading || !isAppReady) return null;

  return (
    <Routes>
      {/* Rotas de Autenticação (Sem Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<LoginPage isRegister={true} />} />

      {/* Rota Principal (Landing) - Mantida para quem chega agora */}
      <Route path="/" element={
        <div className="bg-[#0B1120] min-h-screen text-white">
          <LandingPage onStartChat={handleSendMessage} />
        </div>
      } />

      {/* Rotas do Sistema (Com DashboardLayout) */}
      <Route path="/chat" element={
        <DashboardLayout>
          <ChatInterface 
            state={chatState} 
            settings={adminSettings}
            onSend={handleSendMessage} 
            onNewChat={() => setIsModalOpen(true)}
          />
        </DashboardLayout>
      } />

      <Route path="/minha-conta" element={
        <DashboardLayout>
          <div className="p-10 flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Minha Conta</h2>
            <p>Página em desenvolvimento.</p>
          </div>
        </DashboardLayout>
      } />

      <Route path="/planos" element={
        <DashboardLayout>
          <div className="p-10 flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinar Plano</h2>
            <p>Página em desenvolvimento.</p>
          </div>
        </DashboardLayout>
      } />

      <Route path="/adm" element={
        <ProtectedRoute>
          <AdminPage settings={adminSettings} onSave={handleSaveSettings} onBack={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Modais Globais */}
      <Route path="*" element={
        <Modal
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            setChatState({ messages: [], isThinking: false });
            localStorage.removeItem(STORAGE_KEY);
            setIsModalOpen(false);
            navigate('/');
          }}
          title="Deseja limpar o histórico?"
          message="Esta ação apagará toda a conversa atual localmente."
        />
      } />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;