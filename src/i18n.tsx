import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Language } from "ogg-core";
import { UI_MESSAGES } from "./content/uiMessages.ts";
export type { Language } from "ogg-core";

const STORAGE_KEY = "ogg.language";

type MessageKey = keyof typeof UI_MESSAGES.de;
type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "fr" || saved === "it" || saved === "es" ? saved : "de";
  });
  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage(next) { localStorage.setItem(STORAGE_KEY, next); document.documentElement.lang = next; setLanguageState(next); },
    t(key, values = {}) { let result: string = UI_MESSAGES[language][key]; for (const [name, replacement] of Object.entries(values)) result = result.replace(`{${name}}`, String(replacement)); return result; },
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
