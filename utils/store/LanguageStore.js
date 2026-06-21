let currentLanguage = "en";

export const setLanguage = (lang) => {
  currentLanguage = lang;

  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }
};

export const getLanguage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lang") || currentLanguage;
  }

  return currentLanguage;
};