import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/** JWT 토큰에서 userId(string)를 검증하고 반환. 실패 시 null 반환. */
function verifyUserToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      userId: string;
    };
    return decoded.userId ?? null;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const authenticatedUserId = verifyUserToken(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { message: "유효하지 않은 장바구니 ID입니다." },
        { status: 400 }
      );
    }

    // 해당 장바구니 아이템이 실제로 이 사용자의 것인지 검증
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: numericId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (cartItem.userId !== authenticatedUserId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    await prisma.cartItem.delete({ where: { id: numericId } });
    return NextResponse.json({ success: true, message: "삭제 완료" });
  } catch (error) {
    console.error("장바구니 삭제 실패:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const authenticatedUserId = verifyUserToken(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { message: "유효하지 않은 장바구니 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { message: "수량은 1 이상의 정수여야 합니다." },
        { status: 400 }
      );
    }

    // 해당 장바구니 아이템이 실제로 이 사용자의 것인지 검증
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: numericId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (cartItem.userId !== authenticatedUserId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: numericId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, cartItem: updated });
  } catch (error) {
    console.error("수량 변경 실패:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
