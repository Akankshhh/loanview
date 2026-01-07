// src/contexts/I18nContext.tsx
"use client";

import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/constants/appConstants';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface Translations {
  [key: string]: string | Translations;
}

export interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, substitutions?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const loadTranslations = async (lang: Language) => {
      try {
        const module = await import(`@/locales/${lang}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translations for ${lang}:`, error);
        // Fallback to default language if current language translations fail
        if (lang !== DEFAULT_LANGUAGE) {
          const fallbackModule = await import(`@/locales/${DEFAULT_LANGUAGE}.json`);
          setTranslations(fallbackModule.default);
        }
      }
    };
    loadTranslations(language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === lang)) {
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem('loanview-language', lang);
      }
    } else {
      console.warn(`Unsupported language: ${lang}. Falling back to ${DEFAULT_LANGUAGE}.`);
      setLanguageState(DEFAULT_LANGUAGE);
       if (typeof window !== "undefined") {
        localStorage.setItem('loanview-language', DEFAULT_LANGUAGE);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem('loanview-language') as Language | null;
      if (storedLang && SUPPORTED_LANGUAGES.find(l => l.code === storedLang)) {
        setLanguageState(storedLang);
      }
    }
  }, []);


  const t = useCallback((key: string, substitutions?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let text: string | Translations | undefined = translations;

    for (const k of keys) {
      if (text && typeof text === 'object' && k in text) {
        text = text[k];
      } else {
        text = undefined;
        break;
      }
    }

    if (typeof text !== 'string') {
      // console.warn(`Translation key "${key}" not found for language "${language}".`);
      return key; // Return the key itself if not found
    }

    if (substitutions) {
      return Object.entries(substitutions).reduce((acc, [subKey, subValue]) => {
        return acc.replace(new RegExp(`{{${subKey}}}`, 'g'), String(subValue));
      }, text as string);
    }
    
    return text as string;
  }, [translations, language]);

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(language, options).format(value);
  }, [language]);

  const formatDate = useCallback((date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat(language, defaultOptions).format(date);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, formatNumber, formatDate }}>
      {children}
    </I18nContext.Provider>
  );
};
