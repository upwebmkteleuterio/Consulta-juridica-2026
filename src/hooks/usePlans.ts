import { useState } from 'react';
import { Plan } from '../types';

export const usePlans = () => {
  // Dados mockados iniciais baseados no anexo
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Assinatura Consulta Processo',
      badge: '',
      price: '29,90',
      productId: '7d3b0fef-d60f-4786-8e84-d2170a075b8',
      checkoutLink: 'https://pay.cakto.com.br/yo75vpp_81795(',
      benefits: [
        'Busque por CPF',
        'Busque por CNPJ',
        'Busque por nome de uma pessoa',
        'Monitore 5 processos e receba a atu',
        'Faça até 60 buscas por nº de proces'
      ]
    }
  ]);

  const addPlan = () => {
    const newPlan: Plan = {
      id: Date.now().toString(),
      name: '',
      badge: '',
      price: '0,00',
      productId: '',
      checkoutLink: '',
      benefits: ['Novo benefício']
    };
    setPlans([...plans, newPlan]);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans(plans.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  return { plans, addPlan, updatePlan, removePlan };
};