"use client";

import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, User, Phone, ArrowRight } from 'lucide-react';
import { FIRM_LOGO } from '../constants';

interface LoginPageProps {
  isRegister?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ isRegister = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              whatsapp: whatsapp,
            }
          }
        });
        if (error) throw error;
        
        // Se a confirmação de e-mail estiver desativada no Supabase, 
        // o usuário já terá uma sessão e podemos ir para a Home.
        if (data?.session) {
          navigate('/');
        } else {
          setError("Cadastro realizado! Por favor, faça login com suas credenciais.");
          navigate('/login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); // Login sempre vai para a Consulta Jurídica (Landing)
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B1120] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <img src={FIRM_LOGO} alt="Logo" className="h-20 object-contain brightness-0 invert" />
          <h1 className="text-4xl font-bold text-white mt-12 leading-tight">
            Seu Assistente Jurídico <br />
            <span className="text-champagne">Inteligente e Estratégico.</span>
          </h1>
          <p className="text-gray-400 mt-6 max-w-md text-lg font-light leading-relaxed">
            Tenha acesso instantâneo a análises de direitos com base em mais de 10.000 processos reais.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-champagne/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
            Magalhães & Gomes Advogados
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              {isRegister ? "Crie sua conta" : "Bem-vindo de volta"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isRegister 
                ? "Preencha os dados abaixo para iniciar sua consulta." 
                : "Acesse sua plataforma de inteligência jurídica."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 pl-11 text-gray-900 focus:bg-white focus:border-champagne transition-all outline-none"
                      placeholder="Ex: João"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sobrenome</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 px-4 text-gray-900 focus:bg-white focus:border-champagne transition-all outline-none"
                    placeholder="Ex: Silva"
                    required
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 pl-11 text-gray-900 focus:bg-white focus:border-champagne transition-all outline-none"
                    placeholder="21 99999-9999"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Profissional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 pl-11 text-gray-900 focus:bg-white focus:border-champagne transition-all outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 pl-11 text-gray-900 focus:bg-white focus:border-champagne transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-champagne hover:brightness-105 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isRegister ? "Criar minha conta" : "Entrar no Sistema"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            {isRegister ? "Já possui uma conta?" : "Ainda não tem acesso?"} {" "}
            <Link 
              to={isRegister ? "/login" : "/cadastro"} 
              className="text-champagne font-bold hover:underline"
            >
              {isRegister ? "Faça login" : "Cadastre-se agora"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;