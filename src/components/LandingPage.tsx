import React from 'react';
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';

interface LandingPageProps {
  onStartChat: (text: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl w-full space-y-8 mb-12">
        <img src={FIRM_LOGO} alt="Logo" className="h-28 mx-auto object-contain" />
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Consulta Jurídica <span className="text-champagne">IA</span>
        </h1>
        <p className="text-lg text-gray-400">Excelência jurídica com a agilidade da inteligência artificial.</p>
      </div>
      <div className="w-full max-w-3xl">
        <InputBar onSend={onStartChat} placeholder="Descreva seu caso aqui..." />
      </div>
    </div>
  );
};

export default LandingPage;