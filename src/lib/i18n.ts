import i18next from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';

export const fallbackLng = 'en';
export const languages = [fallbackLng, 'ko', 'ph', 'vn'];
export const defaultNS = 'translation';

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => import(`@/../public/locales/${language}/${namespace}.json`)))
  .init({
    fallbackLng,
    lng: fallbackLng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: [defaultNS],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
