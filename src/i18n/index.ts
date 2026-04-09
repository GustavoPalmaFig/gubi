import { initReactI18next } from 'react-i18next';
import { localeOptions } from '@/constants/localeOptions';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';

const I18N_STORAGE_KEY = 'i18nextLng';

function handleStorageChange(e: StorageEvent) {
  if (e.key !== I18N_STORAGE_KEY || e.newValue == null) return;
  if (e.newValue === i18n.language) return;
  void i18n.changeLanguage(e.newValue);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    supportedLngs: localeOptions,
    resources: {
      'pt-BR': { translation: ptBR }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: I18N_STORAGE_KEY
    },
    interpolation: {
      escapeValue: false
    }
  })
  .then(() => window.addEventListener('storage', handleStorageChange));

export default i18n;
