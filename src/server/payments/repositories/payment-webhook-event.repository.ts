import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type CreateWebhookEventInput = {
  eventId: string;
  eventType: string;
  provider?: string;
  orderId?: number;
  paymentKey?: string;
};

export async function createWebhookEventIfAbsent(input: CreateWebhookEventInput) {
  try {
    const created = await prisma.paymentWebhookEvent.create({
      data: {
        eventId: input.eventId,
        eventType: input.eventType,
        provider: input.provider,
        orderId: input.orderId,
        paymentKey: input.paymentKey,
        status: 'RECEIVED',
      },
    });

    return { created: true as const, event: created };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existing = await prisma.paymentWebhookEvent.findUnique({
        where: { eventId: input.eventId },
      });
      return { created: false as const, event: existing };
    }
    throw error;
  }
}

export function markWebhookEventProcessed(eventId: string) {
  return prisma.paymentWebhookEvent.update({
    where: { eventId },
    data: {
      status: 'PROCESSED',
      processedAt: new Date(),
      errorMessage: null,
    },
  });
}

export function markWebhookEventFailed(eventId: string, errorMessage: string) {
  return prisma.paymentWebhookEvent.update({
    where: { eventId },
    data: {
      status: 'FAILED',
      errorMessage,
    },
  });
}
