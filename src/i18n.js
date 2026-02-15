import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enNavbar from "./locales/en/navbar.json";

import bnCommon from "./locales/bn/common.json";
import bnAuth from "./locales/bn/auth.json";
import bnNavbar from "./locales/bn/navbar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        navbar: enNavbar,
      },
      bn: {
        common: bnCommon,
        auth: bnAuth,
        navbar: bnNavbar,
      },
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "auth", "navbar"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
