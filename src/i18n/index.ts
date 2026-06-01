import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { resources } from './resources';

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';

// Map device locale to supported language
const supportedLocales = ['pt', 'en'];
const initialLang = supportedLocales.includes(deviceLocale) ? deviceLocale : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  supportedLngs: supportedLocales,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
export { initialLang };
