import {
  createOrderWithItems,
  createPaymentAndMarkPaid,
  ensureRefundRequestByOrderId,
  findOrderByIdAndUserId,
  findOrderByIdForAdmin,
  findOrdersForAdmin,
  findOrdersByUserId,
  findProductsByIds,
  findShipmentsByOrderId,
  resolveRefundRequestByOrderId,
  updateOrderStatus,
  updatePaymentStatusByOrderId,
  updateShipmentStatusByOrderId,
} from '@/server/orders/repositories/order.repository';
import { AppError } from '@/server/lib/app-error';
import type { OrderStatus } from '@prisma/client';
import type {
  CreateOrderInput,
  PaymentConfirmInput,
} from '@/server/orders/schemas/order.schema';

function toDiscountedPrice(price: number, discountRate: number) {
  return Math.floor(price * (1 - discountRate / 100));
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  if (input.userId !== userId) {
    throw new AppError('권한이 없습니다.', 403);
  }

  const productIds = input.items.map((item) => item.productId);
  const products = await findProductsByIds(productIds);
  const productMap = new Map(products.map((product) => [product.id, product]));

  const orderItems = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(`상품 ID ${item.productId}가 존재하지 않습니다.`, 404);
    }

    return {
      productId: product.id,
      productName: product.name,
      price: toDiscountedPrice(product.price, product.discountRate || 0),
      quantity: item.quantity,
    };
  });

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return createOrderWithItems({
    userId,
    totalPrice,
    receiver: input.receiver.slice(0, 50),
    phone: input.phone.slice(0, 20),
    address: input.address.slice(0, 200),
    memo: (input.memo || '').slice(0, 500),
    items: orderItems,
  });
}

export async function listOrders(userId: string, status?: OrderStatus) {
  return findOrdersByUserId(userId, status);
}

export async function confirmPayment(
  userId: string,
  input: PaymentConfirmInput,
) {
  const order = await findOrderByIdAndUserId(input.orderId, userId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없거나 권한이 없습니다.', 404);
  }
  assertOrderTransition(order.status, 'PAID');
  if (order.totalPrice !== input.amount) {
    throw new AppError('결제 금액이 주문 금액과 일치하지 않습니다.', 400);
  }

  return createPaymentAndMarkPaid({
    orderId: input.orderId,
    provider: input.provider,
    paymentKey: input.paymentKey,
    amount: input.amount,
  });
}

export async function getShipments(userId: string, orderId: number) {
  return findShipmentsByOrderId(orderId, userId);
}

export async function cancelOrder(userId: string, orderId: number) {
  const order = await findOrderByIdAndUserId(orderId, userId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없거나 권한이 없습니다.', 404);
  }

  assertOrderTransition(order.status, 'CANCELED');

  await updateOrderStatus(orderId, 'CANCELED');
  await updatePaymentStatusByOrderId(orderId, 'CANCELED');
  await ensureRefundRequestByOrderId(orderId, 'Customer cancellation request');

  return {
    orderId,
    status: 'CANCELED',
  };
}

type TransitionMap = Record<OrderStatus, OrderStatus[]>;

const ORDER_TRANSITIONS: TransitionMap = {
  PENDING: ['PAID', 'CANCELED'],
  PAID: ['PREPARING', 'CANCELED'],
  PREPARING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELED: [],
  REFUNDED: [],
};

function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  const allowed = ORDER_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new AppError(
      `허용되지 않은 주문 상태 변경입니다. ${from} -> ${to}`,
      409,
    );
  }
}

type FulfilmentStatus = 'PREPARING' | 'SHIPPED' | 'DELIVERED';

export async function advanceOrderStatus(
  userId: string,
  orderId: number,
  toStatus: FulfilmentStatus,
) {
  const order = await findOrderByIdAndUserId(orderId, userId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없거나 권한이 없습니다.', 404);
  }

  assertOrderTransition(order.status, toStatus);
  await updateOrderStatus(orderId, toStatus);
  return {
    orderId,
    from: order.status,
    to: toStatus,
  };
}

type AdminOrderFilter = {
  status?: OrderStatus;
  searchOrderId?: number;
};

export async function listOrdersForAdmin(filter?: AdminOrderFilter) {
  return findOrdersForAdmin(filter);
}

export async function getOrderDetailForAdmin(orderId: number) {
  const order = await findOrderByIdForAdmin(orderId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없습니다.', 404);
  }
  return order;
}

export async function advanceOrderStatusForAdmin(
  orderId: number,
  toStatus: FulfilmentStatus,
) {
  const order = await findOrderByIdForAdmin(orderId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없습니다.', 404);
  }

  assertOrderTransition(order.status, toStatus);
  await updateOrderStatus(orderId, toStatus);

  if (toStatus === 'PREPARING') {
    await updateShipmentStatusByOrderId(orderId, 'READY');
  } else if (toStatus === 'SHIPPED') {
    await updateShipmentStatusByOrderId(orderId, 'SHIPPED');
  } else if (toStatus === 'DELIVERED') {
    await updateShipmentStatusByOrderId(orderId, 'DELIVERED');
  }

  return {
    orderId,
    from: order.status,
    to: toStatus,
  };
}

export async function resolveRefundRequestForAdmin(params: {
  orderId: number;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}) {
  const order = await findOrderByIdForAdmin(params.orderId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없습니다.', 404);
  }
  if (order.status !== 'CANCELED' && order.status !== 'REFUNDED') {
    throw new AppError('취소/환불 처리 가능한 주문 상태가 아닙니다.', 409);
  }

  const result = await resolveRefundRequestByOrderId(params);
  if (!result.ok) {
    if (result.reason === 'payment_not_found') {
      throw new AppError('결제 정보를 찾을 수 없습니다.', 404);
    }
    throw new AppError('요청된 환불 건이 없습니다.', 404);
  }

  return {
    orderId: params.orderId,
    action: params.action,
    refundStatus: result.refund.status,
  };
}
