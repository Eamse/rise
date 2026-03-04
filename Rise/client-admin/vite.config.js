import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    // 🔧 로컬 개발 전용 프록시: /api, /uploads 요청을 백엔드(5050)로 자동 전달
    // (서버 배포시엔 Nginx가 이 역할을 대신함)
    proxy: {
      "/api": "http://localhost:4002",
      "/uploads": "http://localhost:4002",
    },
  },
});
