import { prisma } from "@/lib/prisma";
import type {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  ShipmentStatus,
} from "@prisma/client";

export async function findProductsByIds(productIds: number[]) {
  return prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, discountRate: true },
  });
}

export async function createOrderWithItems(params: {
  userId: string;
  totalPrice: number;
  receiver: string;
  phone: string;
  address: string;
  memo: string;
  items: Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }>;
}) {
  return prisma.order.create({
    data: {
      userId: params.userId,
      totalPrice: params.totalPrice,
      receiver: params.receiver,
      phone: params.phone,
      address: params.address,
      memo: params.memo,
      status: "PENDING",
      items: {
        create: params.items,
      },
    },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function findOrdersByUserId(
  userId: string,
  status?: OrderStatus,
) {
  return prisma.order.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: { items: true, payment: true, shipments: true },
    orderBy: { id: "desc" },
  });
}

export async function findOrderByIdAndUserId(orderId: number, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
  });
}

export async function createPaymentAndMarkPaid(params: {
  orderId: number;
  provider: string;
  paymentKey: string;
  amount: number;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: params.orderId,
        provider: params.provider,
        paymentKey: params.paymentKey,
        amount: params.amount,
        status: "APPROVED",
        approvedAt: new Date(),
      },
      select: {
        id: true,
        orderId: true,
        status: true,
        amount: true,
        approvedAt: true,
      },
    });

    await tx.order.update({
      where: { id: params.orderId },
      data: { status: "PAID" },
    });

    return payment;
  });
}

export async function findShipmentsByOrderId(orderId: number, userId: string) {
  return prisma.shipment.findMany({
    where: {
      orderId,
      order: { userId },
    },
    include: {
      events: {
        orderBy: { occurredAt: "desc" },
      },
    },
    orderBy: { id: "desc" },
  });
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    select: { id: true, status: true, updatedAt: true },
  });
}

export async function updatePaymentStatusByOrderId(
  orderId: number,
  status: PaymentStatus,
) {
  return prisma.payment.updateMany({
    where: { orderId },
    data: { status },
  });
}

export async function deleteOrdersOlderThanDate(userId: string, cutoffDate: Date) {
  const oldOrders = await prisma.order.findMany({
    where: {
      userId,
      createdAt: { lt: cutoffDate },
    },
    select: { id: true },
  });

  if (oldOrders.length === 0) return { deletedOrderCount: 0 };

  const orderIds = oldOrders.map((order) => order.id);

  await prisma.$transaction(async (tx) => {
    await tx.shipmentEvent.deleteMany({
      where: {
        shipment: {
          orderId: { in: orderIds },
        },
      },
    });

    await tx.refund.deleteMany({
      where: {
        payment: {
          orderId: { in: orderIds },
        },
      },
    });

    await tx.shipment.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    await tx.payment.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    await tx.orderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    await tx.order.deleteMany({
      where: { id: { in: orderIds } },
    });
  });

  return { deletedOrderCount: orderIds.length };
}

export async function findOrdersForAdmin(params?: {
  status?: OrderStatus;
  searchOrderId?: number;
}) {
  return prisma.order.findMany({
    where: {
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.searchOrderId ? { id: params.searchOrderId } : {}),
    },
    include: {
      items: true,
      payment: {
        include: {
          refunds: {
            orderBy: { id: "desc" },
          },
        },
      },
      shipments: {
        orderBy: { id: "desc" },
      },
    },
    orderBy: { id: "desc" },
    take: 200,
  });
}

export async function findOrderByIdForAdmin(orderId: number) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: {
        include: {
          refunds: {
            orderBy: { id: "desc" },
          },
        },
      },
      shipments: {
        include: {
          events: {
            orderBy: { occurredAt: "desc" },
          },
        },
        orderBy: { id: "desc" },
      },
    },
  });
}

export async function updateShipmentStatusByOrderId(
  orderId: number,
  status: ShipmentStatus,
) {
  return prisma.shipment.updateMany({
    where: { orderId },
    data: {
      status,
      ...(status === "SHIPPED" ? { shippedAt: new Date() } : {}),
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
  });
}

export async function ensureRefundRequestByOrderId(orderId: number, reason: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId },
      include: { refunds: true },
    });
    if (!payment) return null;

    if (payment.status !== "APPROVED" && payment.status !== "CANCELED") {
      return null;
    }

    const requested = payment.refunds.find((refund) => refund.status === "REQUESTED");
    if (requested) return requested;

    return tx.refund.create({
      data: {
        paymentId: payment.id,
        reason,
        status: "REQUESTED",
        amount: payment.amount,
      },
    });
  });
}

export async function resolveRefundRequestByOrderId(params: {
  orderId: number;
  action: "APPROVE" | "REJECT";
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId: params.orderId },
      include: {
        refunds: {
          where: { status: "REQUESTED" },
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });
    if (!payment) return { ok: false as const, reason: "payment_not_found" as const };

    const targetRefund = payment.refunds[0];
    if (!targetRefund) {
      return { ok: false as const, reason: "refund_request_not_found" as const };
    }

    const nextRefundStatus: RefundStatus =
      params.action === "APPROVE" ? "APPROVED" : "REJECTED";
    const resolvedReason =
      params.reason?.trim() ||
      (params.action === "APPROVE"
        ? targetRefund.reason
        : `${targetRefund.reason} (rejected by admin)`);

    const updatedRefund = await tx.refund.update({
      where: { id: targetRefund.id },
      data: {
        status: nextRefundStatus,
        reason: resolvedReason,
        ...(params.action === "APPROVE" ? { approvedAt: new Date() } : {}),
      },
    });

    if (params.action === "APPROVE") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
      await tx.order.update({
        where: { id: params.orderId },
        data: { status: "REFUNDED" },
      });
    }

    return {
      ok: true as const,
      refund: updatedRefund,
    };
  });
}
