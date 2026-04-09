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
    const { userId, password } = body;

    const limitKey = buildRateLimitKey(
      "auth:login",
      request,
      typeof userId === "string" ? userId : undefined,
    );
    const rate = checkRateLimit(limitKey, { limit: 10, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    // 입력값 기본 검증
    if (!userId || !password) {
      return NextResponse.json(
        { message: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // userId 타입 안전 검사
    if (typeof userId !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "잘못된 입력값입니다." },
        { status: 400 }
      );
    }

    // JWT_SECRET 환경변수 검증 (배포 시 반드시 설정해야 함)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("🚨 [SECURITY] JWT_SECRET 환경변수가 설정되지 않았습니다!");
      return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
    }

    // 아이디/비밀번호가 틀렸을 때 어느 쪽이 틀렸는지 노출하지 않음 (정보 노출 방지)
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user.id, userId: user.userId },
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
        message: "로그인 성공",
        userId: user.userId,
      },
      { status: 200 }
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("로그인 실패:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
