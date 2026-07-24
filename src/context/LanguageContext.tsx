import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, QUESTIONS_I18N, UI_TRANSLATIONS, Question } from "../i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  ui: typeof UI_TRANSLATIONS["ja"];
  questions: Question[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("app_lang");
      if (saved === "ja" || saved === "en") return saved;
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith("en")) return "en";
    } catch (e) {
      console.error(e);
    }
    return "ja";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("app_lang", newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLang = () => {
    setLang(lang === "ja" ? "en" : "ja");
  };

  // Translation helper function using dot notation e.g., t("home.heroTitle")
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split(".");
    let current: any = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS["ja"];
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to Japanese if key not found in current language
        let fallback: any = UI_TRANSLATIONS["ja"];
        for (const fKey of keys) {
          if (fallback && typeof fallback === "object" && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return keyPath;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === "string") {
      let result = current;
      if (params) {
        Object.entries(params).forEach(([pK, pV]) => {
          result = result.replace(new RegExp(`\\{${pK}\\}`, "g"), String(pV));
        });
      }
      return result;
    }

    return keyPath;
  };

  const ui = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS["ja"];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, ui, questions: QUESTIONS_I18N }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
