"use client";

import React, { useRef } from 'react';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Formata a string de dígitos em formato moeda (0,00)
  const formatValue = (digits: string) => {
    const numericValue = parseInt(digits || '0', 10);
    const decimalValue = (numericValue / 100).toFixed(2);
    return decimalValue.replace('.', ',');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não é dígito
    const rawValue = e.target.value.replace(/\D/g, '');
    
    // Previne zeros excessivos à esquerda e limita tamanho
    const digits = rawValue.replace(/^0+/, '');
    
    // Atualiza o estado com o valor formatado
    onChange(formatValue(digits));
  };

  const moveCursorToEnd = () => {
    // Pequeno delay para garantir que o navegador processou o clique/foco
    setTimeout(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onFocus={moveCursorToEnd}
      onClick={moveCursorToEnd}
      className={className}
      placeholder="0,00"
      inputMode="numeric"
    />
  );
};

export default PriceInput;