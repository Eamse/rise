const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(value: string) {
  return value.trim().toLowerCase();
}

function isStrictOriginCheckEnabled() {
  const raw = process.env.ADMIN_STRICT_ORIGIN_CHECK;
  if (!raw) return true;
  return raw !== "false";
}

export function isTrustedOriginRequest(request: Request) {
  const method = request.method.toUpperCase();
  if (SAFE_METHODS.has(method)) {
    return { trusted: true, reason: "safe_method" as const };
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    if (!isStrictOriginCheckEnabled()) {
      return { trusted: true, reason: "origin_missing_but_allowed" as const };
    }
    return { trusted: false, reason: "origin_missing" as const };
  }

  let requestOrigin: string;
  let originHeader: string;
  try {
    requestOrigin = normalizeOrigin(new URL(request.url).origin);
    originHeader = normalizeOrigin(new URL(origin).origin);
  } catch {
    return { trusted: false, reason: "origin_parse_failed" as const };
  }

  if (requestOrigin !== originHeader) {
    return { trusted: false, reason: "origin_mismatch" as const };
  }

  return { trusted: true, reason: "origin_matched" as const };
}

