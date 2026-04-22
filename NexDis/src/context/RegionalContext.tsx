import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, CURRENCIES } from '../types';

interface RegionalContextType {
  currency: Currency;
  setCurrencyByCode: (code: string) => void;
  formatPrice: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  timeZone: string;
}

const RegionalContext = createContext<RegionalContextType | undefined>(undefined);

export function RegionalProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('nexdist_currency');
    return saved ? JSON.parse(saved) : CURRENCIES[0];
  });

  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    localStorage.setItem('nexdist_currency', JSON.stringify(currency));
  }, [currency]);

  const setCurrencyByCode = (code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setCurrency(found);
  };

  const formatPrice = (amount: number) => {
    return `${currency.symbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeZone: timeZone
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      timeStyle: 'short',
      timeZone: timeZone
    }).format(date);
  };

  return (
    <RegionalContext.Provider value={{ 
      currency, 
      setCurrencyByCode, 
      formatPrice, 
      formatDate, 
      formatTime,
      timeZone 
    }}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegional() {
  const context = useContext(RegionalContext);
  if (context === undefined) {
    throw new Error('useRegional must be used within a RegionalProvider');
  }
  return context;
}
