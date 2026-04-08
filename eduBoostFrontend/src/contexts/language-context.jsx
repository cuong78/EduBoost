import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "eduboost.language";
const SUPPORTED_LANGUAGES = ["vi", "en"];

const LanguageContext = createContext(null);

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "vi";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  return "vi";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute("data-language", language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isVietnamese: language === "vi",
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
