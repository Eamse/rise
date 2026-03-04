import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { userId, items, receiver, phone, address, memo } = req.body;
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const data = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        receiver,
        phone,
        address,
        memo,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });
    res.status(201).json({
      success: true,
      orderId: data.id,
    });
  } catch (error) {
    console.error("서버 오류 발생: ", error);
    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
    });
  }
});

export default router;
