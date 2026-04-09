import crypto from 'crypto';
import { AppError } from '@/server/lib/app-error';
import { confirmPayment } from '@/server/orders/services/order.service';
import { getPaymentProvider } from '@/server/payments/provider-factory';
import {
  decryptPaymentToken,
  encryptPaymentToken,
} from '@/server/payments/security/token-crypto';
import {
  countPaymentMethodsByUserId,
  createPaymentMethod,
  deactivatePaymentMethod,
  findPaymentMethodByIdAndUserId,
  listPaymentMethodsByUserId,
  markPaymentMethodUsed,
  setDefaultPaymentMethod,
} from '@/server/payments/repositories/payment-method.repository';
import { findOrderByIdAndUserId } from '@/server/orders/repositories/order.repository';

const SUPPORTED_BANKS = new Set(['BPI', 'BDO']);

type RegisterPaymentMethodInput = {
  bank: string;
  cardBrand: string;
  cardAlias?: string;
  cardLast4: string;
};

type CheckoutPaymentInput = {
  orderId: number;
  paymentMethodId: number;
};

function assertPaymentExecutionAllowed() {
  const isProduction = process.env.NODE_ENV === 'production';
  const mockEnabled = process.env.PAYMENT_MOCK_ENABLED === 'true';

  if (isProduction && !mockEnabled) {
    throw new AppError(
      '운영 환경에서는 실제 결제 연동 전까지 결제를 실행할 수 없습니다.',
      503,
    );
  }
}

function resolveMethodToken(storedToken: string) {
  if (storedToken.startsWith('v1:')) {
    return decryptPaymentToken(storedToken);
  }
  // Backward compatibility for legacy plain tokens created before encryption rollout.
  return storedToken;
}

function normalizeBank(bank: string) {
  return bank.trim().toUpperCase();
}

function sanitizeCardLast4(last4: string) {
  const value = last4.replace(/\D/g, '');
  if (value.length !== 4) {
    throw new AppError('카드 뒤 4자리를 정확히 입력해주세요.', 400);
  }
  return value;
}

function toMaskedCard(last4: string) {
  return `****-****-****-${last4}`;
}

function createProviderToken(bank: string, userId: string) {
  const random = crypto.randomBytes(16).toString('hex');
  return `pm_${bank.toLowerCase()}_${userId}_${random}`;
}

export async function getPaymentMethods(userId: string) {
  return listPaymentMethodsByUserId(userId);
}

export async function registerPaymentMethod(
  userId: string,
  input: RegisterPaymentMethodInput,
) {
  const bank = normalizeBank(input.bank);
  if (!SUPPORTED_BANKS.has(bank)) {
    throw new AppError('지원하지 않는 은행입니다.', 400);
  }

  const cardBrand = input.cardBrand?.trim();
  if (!cardBrand) {
    throw new AppError('카드 브랜드를 입력해주세요.', 400);
  }

  const cardLast4 = sanitizeCardLast4(input.cardLast4);
  const activeCount = await countPaymentMethodsByUserId(userId);

  return createPaymentMethod({
    userId,
    bank,
    cardBrand,
    cardAlias: input.cardAlias?.trim() || undefined,
    maskedCard: toMaskedCard(cardLast4),
    providerToken: encryptPaymentToken(createProviderToken(bank, userId)),
    isDefault: activeCount === 0,
  });
}

export async function setDefaultMethod(userId: string, methodId: number) {
  const method = await findPaymentMethodByIdAndUserId(methodId, userId);
  if (!method) {
    throw new AppError('결제 수단을 찾을 수 없습니다.', 404);
  }

  await setDefaultPaymentMethod(userId, method.id);
  return { id: method.id, isDefault: true };
}

export async function removePaymentMethod(userId: string, methodId: number) {
  const method = await findPaymentMethodByIdAndUserId(methodId, userId);
  if (!method) {
    throw new AppError('결제 수단을 찾을 수 없습니다.', 404);
  }

  await deactivatePaymentMethod(method.id);

  const activeMethods = await listPaymentMethodsByUserId(userId);
  if (!activeMethods.some((item) => item.isDefault) && activeMethods[0]) {
    await setDefaultPaymentMethod(userId, activeMethods[0].id);
  }

  return { id: method.id, removed: true };
}

export async function checkoutWithPaymentMethod(
  userId: string,
  input: CheckoutPaymentInput,
) {
  const order = await findOrderByIdAndUserId(input.orderId, userId);
  if (!order) {
    throw new AppError('주문을 찾을 수 없거나 권한이 없습니다.', 404);
  }

  if (order.status !== 'PENDING') {
    throw new AppError('결제 가능한 주문 상태가 아닙니다.', 409);
  }

  const method = await findPaymentMethodByIdAndUserId(
    input.paymentMethodId,
    userId,
  );
  if (!method) {
    throw new AppError('결제 수단을 찾을 수 없습니다.', 404);
  }

  assertPaymentExecutionAllowed();

  const provider = getPaymentProvider(method.bank);
  const chargeResult = await provider.charge({
    orderId: order.id,
    amount: order.totalPrice,
    currency: 'PHP',
    methodToken: resolveMethodToken(method.providerToken),
    userId,
    metadata: {
      paymentMethodId: String(method.id),
    },
  });

  if (!chargeResult.success) {
    throw new AppError('결제 승인에 실패했습니다.', 400);
  }

  const payment = await confirmPayment(userId, {
    orderId: order.id,
    provider: chargeResult.provider,
    paymentKey: chargeResult.paymentKey,
    amount: order.totalPrice,
  });

  await markPaymentMethodUsed(userId, method.id);

  return {
    orderId: order.id,
    payment,
    paymentMethod: {
      id: method.id,
      bank: method.bank,
      cardBrand: method.cardBrand,
      maskedCard: method.maskedCard,
    },
  };
}
