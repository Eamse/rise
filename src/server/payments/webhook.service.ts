import { AppError, isAppError } from '@/server/lib/app-error';
import { confirmPayment } from '@/server/orders/services/order.service';
import {
  createWebhookEventIfAbsent,
  markWebhookEventFailed,
  markWebhookEventProcessed,
} from '@/server/payments/repositories/payment-webhook-event.repository';

type WebhookEventType = 'payment.approved' | 'payment.failed';

type WebhookPayload = {
  eventId: string;
  eventType: WebhookEventType;
  occurredAt: string;
  data: {
    orderId: number;
    amount: number;
    paymentKey: string;
    provider: string;
    userId: string;
  };
};

export async function handlePaymentWebhook(rawBody: string) {
  let payload: WebhookPayload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new AppError('JSON 형식이 올바르지 않습니다.', 400);
  }

  if (!payload.eventId || !payload.eventType || !payload.data) {
    throw new AppError('필수 필드가 누락되었습니다.', 400);
  }

  const { orderId, amount, paymentKey, provider, userId } = payload.data;
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0 ||
    !Number.isInteger(amount) ||
    amount < 0 ||
    typeof paymentKey !== 'string' ||
    !paymentKey.trim() ||
    typeof provider !== 'string' ||
    !provider.trim() ||
    typeof userId !== 'string' ||
    !userId.trim()
  ) {
    throw new AppError('웹훅 결제 데이터 형식이 올바르지 않습니다.', 400);
  }

  const idempotency = await createWebhookEventIfAbsent({
    eventId: payload.eventId,
    eventType: payload.eventType,
    provider: provider.trim(),
    orderId,
    paymentKey: paymentKey.trim(),
  });

  if (!idempotency.created) {
    return {
      eventId: payload.eventId,
      status: 'DUPLICATE_IGNORED' as const,
    };
  }

  try {
    if (payload.eventType === 'payment.approved') {
      await confirmPayment(userId, {
        orderId,
        provider: provider.trim(),
        paymentKey: paymentKey.trim(),
        amount,
      });
      await markWebhookEventProcessed(payload.eventId);
      return { eventId: payload.eventId, status: 'APPROVED_HANDLED' as const };
    }

    if (payload.eventType === 'payment.failed') {
      await markWebhookEventProcessed(payload.eventId);
      return { eventId: payload.eventId, status: 'FAILED_HANDLED' as const };
    }

    throw new AppError('지원하지 않는 이벤트입니다.', 400);
  } catch (error) {
    if (error instanceof Error) {
      await markWebhookEventFailed(payload.eventId, error.message);
    } else {
      await markWebhookEventFailed(payload.eventId, '알 수 없는 오류');
    }

    if (payload.eventType === 'payment.approved') {
      if (isAppError(error) && error.statusCode === 409) {
        return {
          eventId: payload.eventId,
          status: 'APPROVED_ALREADY_HANDLED' as const,
        };
      }
    }

    throw error;
  }
}
