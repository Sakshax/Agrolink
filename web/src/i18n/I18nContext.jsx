import { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "./en";
import mr from "./mr";

const translations = { en, mr };

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    // Persist language preference
    try {
      return localStorage.getItem("agrolink_lang") || "en";
    } catch {
      return "en";
    }
  });

  const switchLocale = useCallback((lang) => {
    setLocale(lang);
    try {
      localStorage.setItem("agrolink_lang", lang);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale: switchLocale, t }),
    [locale, switchLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
