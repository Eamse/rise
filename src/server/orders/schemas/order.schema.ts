export type CreateOrderItemInput = {
  productId: number;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string;
  items: CreateOrderItemInput[];
  receiver: string;
  phone: string;
  address: string;
  memo?: string;
};

export type PaymentConfirmInput = {
  orderId: number;
  provider: string;
  paymentKey: string;
  amount: number;
};

export function parseCreateOrderInput(body: unknown): CreateOrderInput | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = body as Partial<CreateOrderInput>;

  if (
    typeof candidate.userId !== 'string' ||
    !Array.isArray(candidate.items) ||
    typeof candidate.receiver !== 'string' ||
    typeof candidate.phone !== 'string' ||
    typeof candidate.address !== 'string'
  ) {
    return null;
  }

  const validItems = candidate.items.every((item) => {
    return (
      item &&
      typeof item === 'object' &&
      Number.isInteger((item as CreateOrderItemInput).productId) &&
      (item as CreateOrderItemInput).productId > 0 &&
      Number.isInteger((item as CreateOrderItemInput).quantity) &&
      (item as CreateOrderItemInput).quantity > 0
    );
  });

  if (!validItems || candidate.items.length === 0) return null;
  if (
    !candidate.receiver.trim() ||
    !candidate.phone.trim() ||
    !candidate.address.trim()
  ) {
    return null;
  }

  return {
    userId: candidate.userId,
    items: candidate.items,
    receiver: candidate.receiver,
    phone: candidate.phone,
    address: candidate.address,
    memo: typeof candidate.memo === 'string' ? candidate.memo : '',
  };
}

export function parsePaymentConfirmInput(
  body: unknown,
): PaymentConfirmInput | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = body as Partial<PaymentConfirmInput>;
  const { orderId, provider, paymentKey, amount } = candidate;

  if (
    typeof orderId !== 'number' ||
    !Number.isInteger(orderId) ||
    orderId <= 0 ||
    typeof provider !== 'string' ||
    !provider.trim() ||
    typeof paymentKey !== 'string' ||
    !paymentKey.trim() ||
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount < 0
  ) {
    return null;
  }

  return {
    orderId,
    provider: provider.trim(),
    paymentKey: paymentKey.trim(),
    amount,
  };
}
