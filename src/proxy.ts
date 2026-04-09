import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 로그인 시 저장되는 쿠키 이름 (cookies.ts와 동일해야 함)
const AUTH_COOKIE_NAME = 'rise_auth';

// JWT를 만들 때 넣은 audience 값 (jwt.ts / login route와 동일)
const JWT_ADMIN_AUDIENCE = process.env.JWT_ADMIN_AUDIENCE ?? 'rise-admin';
const JWT_USER_AUDIENCE = process.env.JWT_USER_AUDIENCE ?? 'rise-users';

/**
 * JWT는 [헤더].[페이로드].[서명] 3개를 점(.)으로 이은 문자열입니다.
 * 여기서는 서명 검증 없이 페이로드만 꺼냅니다.
 *
 * ⚠️ 서명 검증은 각 API route에서 jsonwebtoken으로 따로 합니다.
 *    middleware는 "이 사람이 로그인 상태인가?" 만 빠르게 확인해 redirect 용도로만 씁니다.
 *    서명 없는 가짜 토큰으로 redirect를 피해도, API는 실제 서명을 검증하므로 실제 데이터 접근은 불가합니다.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // JWT는 Base64URL 인코딩을 씁니다. atob()은 Base64를 디코딩하는 Web API입니다.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** 토큰 만료 여부 확인 (exp = Unix 타임스탬프) */
function isExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== 'number') return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

/** JWT의 audience 클레임이 기댓값과 일치하는지 확인 */
function hasAudience(
  payload: Record<string, unknown>,
  expected: string,
): boolean {
  const aud = payload.aud;
  if (typeof aud === 'string') return aud === expected;
  if (Array.isArray(aud)) return (aud as string[]).includes(expected);
  return false;
}

/** 쿠키에서 토큰을 꺼내 audience 기준으로 유효성 검사 */
function isValidToken(token: string | undefined, audience: string): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (isExpired(payload)) return false;
  return hasAudience(payload, audience);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // ─────────────────────────────────────────────
  // 1) 어드민 로그인 페이지: 이미 로그인된 관리자는 대시보드로
  // ─────────────────────────────────────────────
  if (pathname === '/admin/login') {
    if (isValidToken(token, JWT_ADMIN_AUDIENCE)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // 2) 어드민 페이지: 관리자 토큰 없으면 로그인 페이지로
  // ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isValidToken(token, JWT_ADMIN_AUDIENCE)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // ─────────────────────────────────────────────
  // 3) 마이페이지: 일반 유저 토큰 없으면 로그인 페이지로
  // ─────────────────────────────────────────────
  if (pathname.startsWith('/mypage')) {
    if (!isValidToken(token, JWT_USER_AUDIENCE)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  // 4) 로그인·회원가입 페이지: 이미 로그인된 유저는 메인으로
  if (pathname === '/login' || pathname === '/signup') {
    if (isValidToken(token, JWT_USER_AUDIENCE)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  // 5) 장바구니·결제 페이지: 로그인 안 됐으면 로그인 페이지로
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
    if (!isValidToken(token, JWT_USER_AUDIENCE)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  // 6) 주문완료 페이지: 로그인 안 됐으면 로그인 페이지로
  if (pathname.startsWith('/order-complete')) {
    if (!isValidToken(token, JWT_USER_AUDIENCE)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}

/**
 * matcher: middleware가 실행될 경로를 지정합니다.
 * 여기에 없는 경로는 middleware를 거치지 않습니다.
 * (예: 정적 파일, _next 내부 파일 등은 제외됩니다)
 */
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/mypage',
    '/mypage/:path*',
    '/cart',
    '/cart/:path*',
    '/checkout',
    '/checkout/:path*',
    '/login',
    '/signup',
    '/order-complete',
    '/order-complete/:path*',
  ],
};
