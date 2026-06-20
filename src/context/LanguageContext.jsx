import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translate } from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'wardwatch:lang';

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'ne' ? 'ne' : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  }, []);

  const t = useCallback((key) => translate(key, language), [language]);

  const value = useMemo(() => ({
    language, setLanguage, toggleLanguage, t, isNepali: language === 'ne',
  }), [language, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
