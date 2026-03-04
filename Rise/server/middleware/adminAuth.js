// middleware/adminAuth.js - 관리자 전용 인증 미들웨어
import jwt from "jsonwebtoken";

export function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "관리자 토큰이 없습니다. 로그인이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // role이 "admin"인지 반드시 검증! (일반 유저 토큰으로 어드민 API 접근 원천 차단)
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "관리자 권한이 없습니다." });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "유효하지 않거나 만료된 토큰입니다." });
  }
}
