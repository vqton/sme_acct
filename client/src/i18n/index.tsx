import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import vi from './vi.json';
import en from './en.json';

export type Locale = 'vi' | 'en';

const translations: Record<Locale, Record<string, string>> = { vi, en };

interface I18nState {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nState | null>(null);

function getInitialLocale(): Locale {
  const saved = localStorage.getItem('locale');
  if (saved === 'vi' || saved === 'en') return saved;
  return 'vi';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale][key] ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
