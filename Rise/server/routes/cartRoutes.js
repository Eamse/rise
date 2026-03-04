import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// 1. 장바구니에 아이템 담기 (POST /api/cart)
// ==========================================
router.post("/", async (req, res) => {
  try {
    // 🚧 TODO: 클라이언트로부터 userId, productId, quantity 받기
    const { userId, productId, quantity } = req.body;
    // 🚧 TODO: 필수값(위 3개)이 모두 있는지 확인하고 없으면 에러(400) 뱉기
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "필수 항목(userId, productId, quantity)이 누락되었습니다.",
      });
    }
    // 🚧 TODO: 이미 장바구니에 똑같은 상품(userId & productId 일치)이 있다면?
    const cartItems = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      // -> 새로 추가하지 말고 기존 quantity에 더하기 (update)
      update: {
        quantity: { increment: quantity },
      },
      // -> 없다면 새로 만들기 (create)
      create: {
        userId,
        productId,
        quantity,
      },
    });
    // 🚧 TODO: 성공적으로 저장되었다고 응답(200 또는 201) 보내기
    return res.status(200).json({
      success: true,
      message: "장바구니에 상품이 담겼습니다.",
    });
  } catch (error) {
    console.error("장바구니 담기 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// ==========================================
// 2. 내 장바구니 목록 조회하기 (GET /api/cart?userId=아이디)
// ==========================================
router.get("/", async (req, res) => {
  try {
    // 🚧 TODO: 요청 쿼리(req.query)에서 userId 가져오기
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId가 필요합니다.",
      });
    }
    // 🚧 TODO: Prisma의 findMany()를 써서 내 아이디에 해당하는 CartItem 모두 찾기
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(cartItems);

    // (include: { product: true } 를 쓰면 상품 상세정보까지 한방에 가져옴!)
    // 🚧 TODO: 찾은 장바구니 목록 응답(200)으로 쏴주기
  } catch (error) {
    console.error("장바구니 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// ==========================================
// 3. 장바구니 아이템 삭제 (DELETE /api/cart/:id)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.cartItem.delete({ where: { id } });
    res.status(200).json({ success: true, message: "삭제 완료" });
  } catch (error) {
    console.error("장바구니 삭제 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// ==========================================
// 4. 장바구니 수량 변경 (PATCH /api/cart/:id)
// ==========================================
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "수량은 1 이상이어야 합니다." });
    }
    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
    res.status(200).json({ success: true, cartItem: updated });
  } catch (error) {
    console.error("수량 변경 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
