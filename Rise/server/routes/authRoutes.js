import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// POST /api/auth/signup - 회원가입
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    // 1. req.body에서 데이터 받기
    const { userId, name, password, email, company, phone } = req.body;

    // 2. 필수 필드 검증
    if (!userId || !name || !password || !email) {
      return res.status(400).json({
        success: false,
        message:
          "필수 항목을 모두 입력해주세요. (아이디, 이름, 비밀번호, 이메일)",
      });
    }

    // 3. 아이디 중복 체크
    const existingUserId = await prisma.user.findUnique({
      where: { userId: userId },
    });
    if (existingUserId) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    // 4. 이메일 중복 체크
    const existingEmail = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    // 5. 비밀번호 암호화 (bcrypt로 해싱)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. 데이터베이스에 저장
    const newUser = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword, // 암호화된 비밀번호 저장!
        name,
        company: company || "",
        phone: phone || "",
      },
    });

    // 7. JWT 토큰 발급 (= 회원가입 증 자동 로그인 준비)
    const token = jwt.sign(
      { id: newUser.id, userId: newUser.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 8. 성공 응답 (비밀번호는 응답에 포함하지 않음!)
    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다!",
      token, // ← 자동 로그인용 토큰
      userId: newUser.userId, // ← localStorage 저장용
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });
    if (!user) {
      return res.status(401).json({
        message: "아이디를 찾을 수 없습니다.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "비밀번호가 틀렸습니다.",
      });
    }

    const token = jwt.sign(
      { id: user.id, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "로그인 성공",
      token,
      userId: user.userId, // ←←← 이거 추가! 프론트에서 localStorage에 저장할 수 있게
    });
  } catch (error) {
    console.error("로그인 실패:", error);
    res.status(500).json({
      message: "서버 오류",
    });
  }
});
export default router;
