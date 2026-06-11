import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import ro from './locales/ro.json';

const savedLang = localStorage.getItem('techhub_lang') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      ro: { translation: ro },
    },
    lng: savedLang,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export function setLanguage(lang: 'ru' | 'ro') {
  i18n.changeLanguage(lang);
  localStorage.setItem('techhub_lang', lang);
}

export default i18n;