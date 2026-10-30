import { getLocales } from "expo-localization";
import i18n, { type TFunction } from "i18next";
import { initReactI18next } from "react-i18next";
import { ApiError } from "./api";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

// Each language is labelled in its own language, so these two labels are intentionally not translated.
export const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ja", label: "日本語" },
] as const;

const deviceLanguage = getLocales()[0].languageCode;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: deviceLanguage === "ja" ? "ja" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  // Resources are bundled, so initialise synchronously and never render untranslated keys.
  initAsync: false,
});

// Known API error codes get a translated message; anything else falls back to the server's own message.
export function errorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    return t(`errors.${error.code}`, { ...error.details, defaultValue: error.message });
  }
  return t("errors.UNKNOWN_ERROR");
}

export default i18n;
