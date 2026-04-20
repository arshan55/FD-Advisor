import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('fd_mitra_language') || 'hi';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('fd_mitra_language', lang);
  };

  useEffect(() => {
    localStorage.setItem('fd_mitra_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
