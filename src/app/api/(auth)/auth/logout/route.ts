import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/server/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookie(response);
  return response;
}
