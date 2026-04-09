import jwt from 'jsonwebtoken';
import { getAuthTokenFromRequestCookie } from '@/server/auth/cookies';

type UserTokenPayload = {
  id: number;
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
  name?: string;
  username?: string;
};

type AdminTokenPayload = {
  id: number;
  role: 'admin';
  username: string;
  name?: string;
  iat?: number;
  exp?: number;
};

function getTokenFromAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] ?? null;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || null;
}

const JWT_ISSUER = process.env.JWT_ISSUER || 'rise-autoparts';
const JWT_USER_AUDIENCE = process.env.JWT_USER_AUDIENCE || 'rise-users';
const JWT_ADMIN_AUDIENCE = process.env.JWT_ADMIN_AUDIENCE || 'rise-admin';

function verifyToken(token: string, audience: string): UserTokenPayload | null {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience,
    }) as UserTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

function getTokenFromRequest(request: Request) {
  const headerToken = getTokenFromAuthHeader(request);
  const cookieToken = getAuthTokenFromRequestCookie(request);
  return headerToken || cookieToken;
}

export function verifyUserTokenFromRequest(request: Request): string | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token, JWT_USER_AUDIENCE);
  return decoded?.userId ?? null;
}

export function verifyAdminTokenFromRequest(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  const decoded = verifyToken(token, JWT_ADMIN_AUDIENCE);
  return decoded?.role === 'admin';
}

/**
 * 토큰 문자열을 직접 받아서 관리자 페이로드를 반환합니다.
 * next/headers의 cookies()로 읽은 값을 Server Component에서 검증할 때 사용합니다.
 */
export function verifyAdminTokenString(
  token: string,
): AdminTokenPayload | null {
  const decoded = verifyToken(token, JWT_ADMIN_AUDIENCE);
  if (!decoded || decoded.role !== 'admin') return null;
  if (typeof decoded.username !== 'string') return null;
  if (typeof decoded.id !== 'number') return null;

  return {
    id: decoded.id,
    role: 'admin',
    username: decoded.username,
    name: decoded.name,
    iat: decoded.iat,
    exp: decoded.exp,
  };
}

export function verifyAdminTokenPayloadFromRequest(
  request: Request,
): AdminTokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token, JWT_ADMIN_AUDIENCE);
  if (!decoded || decoded.role !== 'admin') return null;

  if (typeof decoded.username !== 'string') return null;
  if (typeof decoded.id !== 'number') return null;

  return {
    id: decoded.id,
    role: 'admin',
    username: decoded.username,
    name: decoded.name,
    iat: decoded.iat,
    exp: decoded.exp,
  };
}

export function verifyUserTokenString(token: string): UserTokenPayload | null {
  const decoded = verifyToken(token, JWT_USER_AUDIENCE);
  if (!decoded) return null;
  if (typeof decoded.userId !== 'string') return null;

  return decoded;
}
