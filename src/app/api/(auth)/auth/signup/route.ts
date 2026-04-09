import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setAuthCookie } from "@/server/auth/cookies";
import { buildRateLimitKey, checkRateLimit } from "@/server/security/rate-limit";

const JWT_ISSUER = process.env.JWT_ISSUER || "rise-autoparts";
const JWT_USER_AUDIENCE = process.env.JWT_USER_AUDIENCE || "rise-users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, password, email, phone } = body;

    const limitKey = buildRateLimitKey(
      "auth:signup",
      request,
      typeof userId === "string" ? userId : undefined,
    );
    const rate = checkRateLimit(limitKey, { limit: 5, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    // 입력값 타입 검증
    if (
      typeof userId !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string" ||
      typeof email !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "잘못된 입력값입니다." },
        { status: 400 }
      );
    }

    if (!userId || !name || !password || !email) {
      return NextResponse.json(
        { success: false, message: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 아이디 길이/형식 검증
    if (userId.length < 4 || userId.length > 20) {
      return NextResponse.json(
        { success: false, message: "아이디는 4~20자여야 합니다." },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "이메일 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // JWT_SECRET 환경변수 검증
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("🚨 [SECURITY] JWT_SECRET 환경변수가 설정되지 않았습니다!");
      return NextResponse.json(
        { success: false, message: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const existingUserId = await prisma.user.findUnique({ where: { userId } });
    if (existingUserId) {
      return NextResponse.json(
        { success: false, message: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        name,
        phone: typeof phone === "string" ? phone : "",
      },
    });

    const token = jwt.sign(
      { id: newUser.id, userId: newUser.userId },
      jwtSecret,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        issuer: JWT_ISSUER,
        audience: JWT_USER_AUDIENCE,
      }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다!",
        userId: newUser.userId,
      },
      { status: 201 }
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("회원가입 에러:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
