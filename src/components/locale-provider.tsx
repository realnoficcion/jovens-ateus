"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, dict, type Locale, type Dict } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "ja_locale";

interface LocaleProviderProps {
  children: React.ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dict[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
