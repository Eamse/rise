import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    // 검사 제외 폴더
    ignores: ["dist", "node_modules"],
  },
  {
    // 프로젝트 전체의 js, jsx 파일을 검사 대상으로 확장
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest", // 최신 문법(const 등) 지원
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, // 추가: routes 폴더 등 Node 환경 코드에서 발생하는 에러 방지
        ...globals.es2020, // 최신 전역 변수 허용
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } }, // 버전 자동 감지
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // 미사용 변수 에러 처리 (단, 대문자로 시작하는 컴포넌트나 _는 허용)
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react/prop-types": "off",
    },
  },
  eslintConfigPrettier,
];
