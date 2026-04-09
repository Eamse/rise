import type { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "rise_auth";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

type SetAuthCookieOptions = {
  maxAge?: number;
};

export function setAuthCookie(
  response: NextResponse,
  token: string,
  options?: SetAuthCookieOptions,
) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // default: 7 days
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getAuthTokenFromRequestCookie(request: Request) {
  const raw = request.headers.get("cookie");
  if (!raw) return null;

  const cookies = raw.split(";").map((part) => part.trim());
  for (const part of cookies) {
    if (!part.startsWith(`${AUTH_COOKIE_NAME}=`)) continue;
    const value = part.slice(`${AUTH_COOKIE_NAME}=`.length);
    return decodeURIComponent(value);
  }

  return null;
}
