import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setAuthCookie } from "@/server/auth/cookies";
import { buildRateLimitKey, checkRateLimit } from "@/server/security/rate-limit";
import { isIpAllowed } from "@/server/security/ip-allowlist";
import { isAdminOtpRequired, verifyAdminOtp } from "@/server/security/admin-otp";
import { notifySecurityEvent } from "@/server/security/security-alert";
import { isTrustedOriginRequest } from "@/server/security/origin-check";
import { getClientIp } from "@/server/security/request-ip";

const JWT_ISSUER = process.env.JWT_ISSUER || "rise-autoparts";
const JWT_ADMIN_AUDIENCE = process.env.JWT_ADMIN_AUDIENCE || "rise-admin";

export async function POST(request: Request) {
  try {
    const originCheck = isTrustedOriginRequest(request);
    if (!originCheck.trusted) {
      await notifySecurityEvent({
        type: "admin_login_origin_blocked",
        level: "warn",
        message: "관리자 로그인 요청이 Origin 검증으로 차단됨",
        ip: getClientIp(request),
        path: "/api/admin/login",
        detail: originCheck.reason,
      });
      return NextResponse.json(
        { message: "허용되지 않은 요청 출처입니다." },
        { status: 403 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "요청 본문(JSON) 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    const { username, password, otpCode } = (body ?? {}) as {
      username?: unknown;
      password?: unknown;
      otpCode?: unknown;
    };
    const ipCheck = isIpAllowed(request);

    if (!ipCheck.allowed) {
      await notifySecurityEvent({
        type: "admin_login_ip_blocked",
        level: "warn",
        message: "허용되지 않은 IP에서 관리자 로그인 시도",
        ip: ipCheck.ip,
        username: typeof username === "string" ? username : undefined,
        path: "/api/admin/login",
      });
      return NextResponse.json({ message: "허용되지 않은 IP입니다." }, { status: 403 });
    }

    const limitKey = buildRateLimitKey(
      "auth:admin:login",
      request,
      typeof username === "string" ? username : undefined,
    );
    const rate = checkRateLimit(limitKey, { limit: 8, windowMs: 60_000 });
    if (!rate.allowed) {
      await notifySecurityEvent({
        type: "admin_login_rate_limited",
        level: "warn",
        message: "관리자 로그인 rate limit 초과",
        ip: ipCheck.ip,
        username: typeof username === "string" ? username : undefined,
        path: "/api/admin/login",
      });
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { message: "아이디와 비밀번호를 입력하세요." },
        { status: 400 }
      );
    }

    // 입력값 타입 검증
    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "잘못된 입력값입니다." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    if (!normalizedUsername || !normalizedPassword) {
      return NextResponse.json(
        { message: "아이디와 비밀번호를 입력하세요." },
        { status: 400 }
      );
    }
    if (normalizedUsername.length > 100 || normalizedPassword.length > 200) {
      return NextResponse.json(
        { message: "입력값 길이가 허용 범위를 초과했습니다." },
        { status: 400 }
      );
    }

    // JWT_SECRET 환경변수 검증
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("🚨 [SECURITY] JWT_SECRET 환경변수가 설정되지 않았습니다!");
      return NextResponse.json(
        { message: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username: normalizedUsername } });
    if (!admin) {
      await notifySecurityEvent({
        type: "admin_login_failed",
        level: "warn",
        message: "관리자 로그인 실패: 존재하지 않는 계정",
        ip: ipCheck.ip,
        username: normalizedUsername,
        path: "/api/admin/login",
      });
      // 어느 쪽이 틀렸는지 노출하지 않음 (사용자 열거 공격 방지)
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      await notifySecurityEvent({
        type: "admin_login_failed",
        level: "warn",
        message: "관리자 로그인 실패: 비밀번호 불일치",
        ip: ipCheck.ip,
        username: normalizedUsername,
        path: "/api/admin/login",
      });
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    if (isAdminOtpRequired()) {
      if (typeof otpCode !== "string" || otpCode.trim().length === 0) {
        await notifySecurityEvent({
          type: "admin_login_failed",
          level: "warn",
          message: "관리자 로그인 실패: OTP 누락",
          ip: ipCheck.ip,
          username: normalizedUsername,
          path: "/api/admin/login",
        });
        return NextResponse.json(
          { message: "OTP 코드가 필요합니다." },
          { status: 401 }
        );
      }

      const otpValid = verifyAdminOtp(normalizedUsername, otpCode.trim());
      if (!otpValid) {
        await notifySecurityEvent({
          type: "admin_login_failed",
          level: "warn",
          message: "관리자 로그인 실패: OTP 불일치",
          ip: ipCheck.ip,
          username: normalizedUsername,
          path: "/api/admin/login",
        });
        return NextResponse.json(
          { message: "아이디, 비밀번호 또는 OTP 코드가 올바르지 않습니다." },
          { status: 401 }
        );
      }
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name, role: "admin" },
      jwtSecret,
      {
        expiresIn: "15m",
        algorithm: "HS256",
        issuer: JWT_ISSUER,
        audience: JWT_ADMIN_AUDIENCE,
      }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "관리자 로그인 성공",
        name: admin.name,
      },
      { status: 200 }
    );
    setAuthCookie(response, token, { maxAge: 60 * 15 });
    return response;
  } catch (error) {
    console.error("관리자 로그인 에러:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
