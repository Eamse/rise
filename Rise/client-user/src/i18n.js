import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi) // JSON 번역 파일을 불러오기 위한 플러그인
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // react-i18next와 연결
  .init({
    fallbackLng: "ko", // 기본 언어 설정 (한국어)
    debug: true, // 개발 모드에서 콘솔에 로그 출력 (배포 시 false)
    interpolation: {
      escapeValue: false, // 리액트는 이미 XSS 방지가 되어 있으므로 false
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // 번역 파일 경로
    },
  });

export default i18n;
