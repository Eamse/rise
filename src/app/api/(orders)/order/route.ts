import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";

export async function POST(request: Request) {
  try {
    // 인증 확인
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "요청 본문(JSON) 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "요청 본문 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const { userId, items, receiver, phone, address, memo } = body as {
      userId?: unknown;
      items?: unknown;
      receiver?: unknown;
      phone?: unknown;
      address?: unknown;
      memo?: unknown;
    };

    // userId 검증 (본인 주문인지 확인)
    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 입력값 기본 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "주문 상품이 없습니다." },
        { status: 400 }
      );
    }

    if (!receiver || !phone || !address) {
      return NextResponse.json(
        { success: false, message: "수령인, 전화번호, 주소는 필수입니다." },
        { status: 400 }
      );
    }

    // ✅ 가격 조작 방지: 클라이언트에서 받은 price를 절대 사용하지 않고
    //    DB에서 실제 상품 가격을 조회하여 계산합니다.
    const productIds: number[] = items.map(
      (item: { productId: number; quantity: number }) => {
        const id = Number(item.productId);
        if (!Number.isInteger(id) || id < 1) {
          throw new Error(`유효하지 않은 상품 ID: ${item.productId}`);
        }
        return id;
      }
    );

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, discountRate: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 모든 상품이 DB에 존재하는지 확인
    for (const productId of productIds) {
      if (!productMap.has(productId)) {
        return NextResponse.json(
          { success: false, message: `상품 ID ${productId}가 존재하지 않습니다.` },
          { status: 400 }
        );
      }
    }

    // 수량 유효성 검사 및 주문 아이템 구성 (DB 가격 사용)
    const orderItems = items.map(
      (item: { productId: number; quantity: number }) => {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(`수량이 유효하지 않습니다: ${item.quantity}`);
        }
        const product = productMap.get(Number(item.productId))!;
        const discountedPrice = Math.floor(product.price * (1 - (product.discountRate || 0) / 100));
        return {
          productId: product.id,
          productName: product.name,
          price: discountedPrice, // 할인된 실제 가격
          quantity,
        };
      }
    );

    // 서버 측에서 총 금액 계산
    const totalPrice = orderItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const data = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        receiver: String(receiver).slice(0, 50),
        phone: String(phone).slice(0, 20),
        address: String(address).slice(0, 200),
        memo: memo ? String(memo).slice(0, 500) : "",
        items: {
          create: orderItems,
        },
      },
    });

    return NextResponse.json(
      { success: true, orderId: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("서버 오류 발생: ", error);
    if (error instanceof Error && error.message.includes("유효하지 않은")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
