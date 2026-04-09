import { getClientIp } from "@/server/security/request-ip";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function now() {
  return Date.now();
}

export function buildRateLimitKey(prefix: string, request: Request, id?: string) {
  const ip = getClientIp(request);
  return `${prefix}:${ip}:${id || "anonymous"}`;
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const current = now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= current) {
    const next: RateLimitEntry = {
      count: 1,
      resetAt: current + options.windowMs,
    };
    store.set(key, next);
    return {
      allowed: true,
      retryAfterSec: 0,
      remaining: options.limit - 1,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  if (existing.count > options.limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - current) / 1000)),
      remaining: 0,
    };
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, options.limit - existing.count),
  };
}
