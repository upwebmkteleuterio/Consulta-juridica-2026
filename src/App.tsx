"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ChatState, Message, AdminSettings } from './types';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import AdminPage from './components/AdminPage';
import LoginPage from './pages/Login';
import UsersManagement from './pages/UsersManagement';
import PlansManagement from './pages/PlansManagement';
import SubscribePlan from './pages/SubscribePlan';
import UsageLimits from './pages/UsageLimits';
import MyAccount from './pages/MyAccount';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import LimitModal from './components/LimitModal';
import { getGeminiStreamResponse } from './services/gemini';
import { DEFAULT_ADMIN_SETTINGS } from './constants';
import { supabase } from './integrations/supabase/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-champagne border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [chatState, setChatState] = useState<ChatState>({ messages: [], isThinking: false });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const pendingMessageSent = useRef(false);

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
          internalInstructions: data.internal_instructions,
          freeMonthlyLimit: data.free_monthly_limit || 3,
          adminMonthlyLimit: data.admin_monthly_limit || 9999
        });
      }
    };
    fetchSettings();
  }, [profile?.credits_used]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!user) {
      setPendingMessage(text);
      setIsAuthModalOpen(true);
      return;
    }

    const limit = profile?.role === 'admin' 
      ? adminSettings.adminMonthlyLimit 
      : (profile?.subscription_status === 'pro' 
          ? (profile?.monthly_limit_snapshot || 50) 
          : adminSettings.freeMonthlyLimit);

    if ((profile?.credits_used || 0) >= limit) {
      setIsLimitModalOpen(true);
      return;
    }

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

      await supabase.from('profiles').update({ 
        credits_used: (profile?.credits_used || 0) + 1,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      await refreshProfile();

    } catch (error) {
      setChatState(prev => ({ ...prev, isThinking: false }));
    }
  }, [chatState.messages, location.pathname, adminSettings, navigate, user, profile, refreshProfile]);

  useEffect(() => {
    if (user && pendingMessage && !pendingMessageSent.current) {
      pendingMessageSent.current = true;
      handleSendMessage(pendingMessage);
      setPendingMessage(null);
    }
  }, [user, pendingMessage, handleSendMessage]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<LoginPage isRegister={true} />} />
        
        <Route path="/" element={<DashboardLayout><LandingPage onStartChat={handleSendMessage} /></DashboardLayout>} />
        <Route path="/chat" element={<DashboardLayout><ChatInterface state={chatState} settings={adminSettings} onSend={handleSendMessage} onNewChat={() => setIsModalOpen(true)} /></DashboardLayout>} />
        
        <Route path="/minha-conta" element={<ProtectedRoute><DashboardLayout><MyAccount /></DashboardLayout></ProtectedRoute>} />
        <Route path="/planos" element={<DashboardLayout><SubscribePlan /></DashboardLayout>} />

        <Route path="/adm/usuarios" element={<ProtectedRoute adminOnly><DashboardLayout><UsersManagement /></DashboardLayout></ProtectedRoute>} />
        <Route path="/adm/planos" element={<ProtectedRoute adminOnly><DashboardLayout><PlansManagement /></DashboardLayout></ProtectedRoute>} />
        <Route path="/adm/limites" element={<ProtectedRoute adminOnly><DashboardLayout><UsageLimits /></DashboardLayout></ProtectedRoute>} />
        <Route path="/adm/configuracoes" element={<ProtectedRoute adminOnly><DashboardLayout><AdminPage settings={adminSettings} onSave={async (newSettings) => {
          const { data: current } = await supabase.from('admin_settings').select('id').limit(1).single();
          if (current) {
            await supabase.from('admin_settings').update({
              office_name: newSettings.officeName,
              office_description: newSettings.officeDescription,
              founders_info: newSettings.foundersInfo,
              addresses: newSettings.addresses,
              malice_prompt: newSettings.malicePrompt,
              negative_prompt: newSettings.negative_prompt,
              whatsapp_number: newSettings.whatsappNumber,
              internal_instructions: newSettings.internalInstructions,
              free_monthly_limit: newSettings.freeMonthlyLimit,
              admin_monthly_limit: newSettings.adminMonthlyLimit
            }).eq('id', current.id);
            setAdminSettings(newSettings);
          }
        }} onBack={() => navigate('/')} /></DashboardLayout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { setChatState({messages: [], isThinking: false}); setIsModalOpen(false); navigate('/'); }} title="Limpar histórico?" message="Deseja apagar a conversa?" />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {}} 
      />

      <LimitModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
        isPro={profile?.subscription_status === 'pro'} 
      />
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