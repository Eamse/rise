// routes/adminAuthRoutes.js - 관리자 전용 로그인 API
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "아이디와 비밀번호를 입력하세요." });
    }

    // Admin 테이블에서만 조회 (일반 User 테이블과 완전 분리!)
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    }

    // JWT 토큰에 role: "admin" 을 심어서 일반 유저 토큰과 구별
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }, // 관리자 세션은 8시간으로 제한
    );

    res.status(200).json({
      success: true,
      message: "관리자 로그인 성공",
      token,
      name: admin.name,
    });
  } catch (error) {
    console.error("관리자 로그인 에러:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
