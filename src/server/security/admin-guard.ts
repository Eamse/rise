import { NextResponse } from "next/server";
import { verifyAdminTokenPayloadFromRequest } from "@/server/auth/jwt";
import { isIpAllowed } from "@/server/security/ip-allowlist";
import { buildRateLimitKey, checkRateLimit } from "@/server/security/rate-limit";
import { notifySecurityEvent } from "@/server/security/security-alert";
import { isTrustedOriginRequest } from "@/server/security/origin-check";
import { getClientIp } from "@/server/security/request-ip";

type AdminGuardResult = {
  ok: true;
  admin: {
    id: number;
    username: string;
    name?: string;
    iat?: number;
  };
} | {
  ok: false;
  response: NextResponse;
};

type AdminGuardOptions = {
  operation: string;
  requireRecentAuth?: boolean;
};

function getMaxSessionAgeSec() {
  const minutes = Number.parseInt(
    process.env.ADMIN_REAUTH_MAX_AGE_MINUTES || "15",
    10,
  );
  if (!Number.isFinite(minutes) || minutes <= 0) return 15 * 60;
  return minutes * 60;
}

export async function requireAdminAccess(
  request: Request,
  options: AdminGuardOptions,
): Promise<AdminGuardResult> {
  const originCheck = isTrustedOriginRequest(request);
  if (!originCheck.trusted) {
    await notifySecurityEvent({
      type: "admin_origin_blocked",
      level: "warn",
      message: "관리자 API 접근이 Origin 검증으로 차단되었습니다.",
      ip: getClientIp(request),
      path: new URL(request.url).pathname,
      detail: `${options.operation}:${originCheck.reason}`,
    });

    return {
      ok: false,
      response: NextResponse.json(
        { message: "허용되지 않은 요청 출처입니다." },
        { status: 403 },
      ),
    };
  }

  const ipCheck = isIpAllowed(request);
  if (!ipCheck.allowed) {
    await notifySecurityEvent({
      type: "admin_ip_blocked",
      level: "warn",
      message: "관리자 API 접근이 IP allowlist 정책으로 차단되었습니다.",
      ip: ipCheck.ip,
      path: new URL(request.url).pathname,
      detail: options.operation,
    });

    return {
      ok: false,
      response: NextResponse.json(
        { message: "허용되지 않은 IP입니다." },
        { status: 403 },
      ),
    };
  }

  const rateKey = buildRateLimitKey("admin:api", request, options.operation);
  const rate = checkRateLimit(rateKey, { limit: 120, windowMs: 60_000 });
  if (!rate.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "요청이 너무 많습니다." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      ),
    };
  }

  const admin = verifyAdminTokenPayloadFromRequest(request);
  if (!admin) {
    await notifySecurityEvent({
      type: "admin_auth_failed",
      level: "warn",
      message: "관리자 API 접근 인증 실패",
      ip: ipCheck.ip,
      path: new URL(request.url).pathname,
      detail: options.operation,
    });
    return {
      ok: false,
      response: NextResponse.json(
        { message: "관리자 인증이 필요합니다." },
        { status: 401 },
      ),
    };
  }

  if (options.requireRecentAuth && typeof admin.iat === "number") {
    const nowSec = Math.floor(Date.now() / 1000);
    const authAgeSec = nowSec - admin.iat;
    if (authAgeSec > getMaxSessionAgeSec()) {
      await notifySecurityEvent({
        type: "admin_reauth_required",
        level: "info",
        message: "민감한 작업에서 재인증이 필요합니다.",
        ip: ipCheck.ip,
        username: admin.username,
        path: new URL(request.url).pathname,
        detail: options.operation,
      });
      return {
        ok: false,
        response: NextResponse.json(
          { message: "재인증이 필요합니다. 다시 로그인해주세요." },
          { status: 401 },
        ),
      };
    }
  }

  return {
    ok: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      iat: admin.iat,
    },
  };
}
