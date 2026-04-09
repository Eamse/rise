import { NextResponse } from "next/server";
import { verifyAdminTokenPayloadFromRequest } from "@/server/auth/jwt";

export async function GET(request: Request) {
  const admin = verifyAdminTokenPayloadFromRequest(request);
  if (!admin) {
    return NextResponse.json(
      { authenticated: false, message: "관리자 인증이 필요합니다." },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name || admin.username,
      },
    },
    { status: 200 },
  );
}

