import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./lang/vi.json";
import ja from "./lang/ja.json";

export const LANG_STORAGE_KEY = "kotonote-lang";

function savedLanguage() {
  if (typeof window === "undefined") return "vi";
  return localStorage.getItem(LANG_STORAGE_KEY) || "vi";
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    ja: { translation: ja },
  },
  lng: savedLanguage(),
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language === "ja" ? "ja" : "vi";
  i18n.on("languageChanged", (lng) => {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
    document.documentElement.lang = lng === "ja" ? "ja" : "vi";
  });
}

export default i18n;
