"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ChatState, Message, AdminSettings } from './types';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import AdminPage from './components/AdminPage';
import LoginPage from './pages/Login';
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

const STORAGE_KEY = 'magalhaes_gomes_chat_history_v3';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [chatState, setChatState] = useState<ChatState>({ messages: [], isThinking: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').limit(1).single();
      if (data) {
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
    };
    fetchSettings();
  }, []);

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
      setChatState(prev => ({ ...prev, isThinking: false }));
    }
  }, [chatState.messages, location.pathname, adminSettings, navigate]);

  if (authLoading) return null;

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<LoginPage isRegister={true} />} />
        <Route path="/" element={<DashboardLayout><LandingPage onStartChat={handleSendMessage} /></DashboardLayout>} />
        <Route path="/chat" element={<DashboardLayout><ChatInterface state={chatState} settings={adminSettings} onSend={handleSendMessage} onNewChat={() => setIsModalOpen(true)} /></DashboardLayout>} />
        <Route path="/minha-conta" element={<DashboardLayout><div className="p-10 text-white">Minha Conta</div></DashboardLayout>} />
        <Route path="/planos" element={<DashboardLayout><div className="p-10 text-white">Planos</div></DashboardLayout>} />
        <Route path="/adm" element={<ProtectedRoute><AdminPage settings={adminSettings} onSave={() => {}} onBack={() => navigate('/')} /></ProtectedRoute>} />
      </Routes>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { setChatState({messages: [], isThinking: false}); setIsModalOpen(false); navigate('/'); }} title="Limpar histórico?" message="Deseja apagar a conversa?" />
    </>
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