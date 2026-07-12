import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { translations } from "./translations";

export type Language = "en" | "es" | "hi" | "pt" | "zh" | "fr";

interface LanguageContextProps {
  language: Language;
  t: (key: string) => string;
  setLanguageState: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    if (user && user.language) {
      setLanguage(user.language as Language);
    } else {
      const stored = localStorage.getItem("language") as Language;
      if (stored && ["en", "es", "hi", "pt", "zh", "fr"].includes(stored)) {
        setLanguage(stored);
      }
    }
  }, [user]);

  const setLanguageState = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    const langTranslations = translations[language] || translations["en"];
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguageState }}>
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
