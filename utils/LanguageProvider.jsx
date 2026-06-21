"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext(null);

let currentLanguage = "en";

export const getLanguage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lang") || currentLanguage;
  }

  return currentLanguage;
};

export const setLanguageValue = (lang) => {
  currentLanguage = lang;

  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";

    currentLanguage = savedLang;

    setLangState(savedLang);

    document.documentElement.lang = savedLang;
  }, []);

  const setLang = (newLang) => {
    setLanguageValue(newLang);

    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLang must be used inside LanguageProvider"
    );
  }

  return context;
};