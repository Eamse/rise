import cors from "cors";
import "dotenv/config";
import express from "express";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
const app = express();

// 1. 미들웨어
app.use(express.json()); // JSON 요청 본문 파싱
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "https://riseautoparts.shop",
      "https://www.riseautoparts.shop",
      "https://admin.riseautoparts.shop",
    ],
  }),
);

// 2. 정적 파일 호스팅 (정적 폴더 개방)
app.use("/uploads", express.static("uploads")); // 업로드된 이미지 접근용

// 3. API 라우터 (Routes)
app.use("/api/auth", authRoutes); // 일반 유저 인증 라우터
app.use("/api/products", productRoutes); // 상품 통신 라우터
app.use("/api/cart", cartRoutes); // 장바구니 라우터
app.use("/api/admin", adminAuthRoutes); // 관리자 전용 인증 라우터
app.use("/api/order", orderRoutes); // 주문 전용 라우터
// 4. 서버 구동
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
