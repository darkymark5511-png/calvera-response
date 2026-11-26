"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANG, isLang, STRINGS, type Lang, type Strings } from "@/i18n";

const STORAGE_KEY = "cr_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Read the stored preference after mount so server and client markup match.
  useEffect(() => {
    let cancelled = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!cancelled && isLang(stored)) {
        queueMicrotask(() => {
          if (!cancelled) setLangState(stored);
        });
      }
    } catch {
      // localStorage can be unavailable in private modes; default is fine.
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures; the choice still applies for this session.
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: STRINGS[lang] }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
