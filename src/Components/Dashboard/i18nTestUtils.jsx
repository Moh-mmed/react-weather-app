import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import ar from "../../locales/ar.json";

const RESOURCES = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

// Creates a fresh i18next instance bound to the real locale files and registers
// it as the active react-i18next instance (no I18nextProvider needed). Each
// call rebinds the global instance, so call it right before rendering a
// component that uses useTranslation().
export const setupI18n = (lng = "en") => {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources: RESOURCES,
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
  return instance;
};
