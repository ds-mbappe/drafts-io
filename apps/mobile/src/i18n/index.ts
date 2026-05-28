import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import de from './de.json';
import it from './it.json';
import jp from './jp.json';
import pt from './pt.json';
import ar from './ar.json';
import zh from './zh.json';
import ko from './ko.json';

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  jp: { translation: jp },
  pt: { translation: pt },
  ar: { translation: ar },
  zh: { translation: zh },
  ko: { translation: ko },
} as const;

export type TranslationKeys = typeof en;
export type SupportedLocale = keyof typeof resources;

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLocales = Object.keys(resources) as SupportedLocale[];
const lng = supportedLocales.includes(deviceLocale as SupportedLocale)
  ? deviceLocale
  : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
