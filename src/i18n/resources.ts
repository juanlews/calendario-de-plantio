import pt from './locales/pt.json';
import en from './locales/en.json';

export const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

export type TranslationResources = typeof en;
