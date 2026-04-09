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

export async function POST(request: Request) {
  try {
    // 인증 확인
    const authenticatedUserId = verifyUserToken(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, productId, quantity } = body;

    // 요청한 userId가 토큰의 userId와 일치하는지 확인 (타인의 장바구니 접근 방지)
    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    if (!productId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "필수 항목(productId, quantity)이 누락되었습니다.",
        },
        { status: 400 }
      );
    }

    // 수량 유효성 검사
    const numQuantity = Number(quantity);
    if (!Number.isInteger(numQuantity) || numQuantity < 1) {
      return NextResponse.json(
        { success: false, message: "수량은 1 이상의 정수여야 합니다." },
        { status: 400 }
      );
    }

    // productId 유효성 검사
    const numProductId = Number(productId);
    if (!Number.isInteger(numProductId) || numProductId < 1) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const product = await prisma.product.findUnique({
      where: { id: numProductId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "존재하지 않는 상품입니다." },
        { status: 404 }
      );
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId: numProductId },
      },
      update: {
        quantity: { increment: numQuantity },
      },
      create: {
        userId,
        productId: numProductId,
        quantity: numQuantity,
      },
    });

    return NextResponse.json(
      { success: true, message: "장바구니에 상품이 담겼습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("장바구니 담기 실패:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 인증 확인
    const authenticatedUserId = verifyUserToken(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId가 필요합니다." },
        { status: 400 }
      );
    }

    // 요청한 userId가 토큰의 userId와 일치하는지 확인
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cartItems, { status: 200 });
  } catch (error) {
    console.error("장바구니 조회 실패:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
