import { getClientIp } from "@/server/security/request-ip";

function normalize(value: string) {
  return value.trim();
}

function readAllowedIps() {
  const raw = process.env.ADMIN_ALLOWED_IPS || "";
  return raw
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

export function isIpAllowed(request: Request) {
  const allowedIps = readAllowedIps();
  if (allowedIps.length === 0) {
    return { allowed: true, ip: getClientIp(request), allowlistEnabled: false };
  }

  const ip = getClientIp(request);
  return {
    allowed: allowedIps.includes(ip),
    ip,
    allowlistEnabled: true,
  };
}

