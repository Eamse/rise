import { prisma } from '@/lib/prisma';

export function listPaymentMethodsByUserId(userId: string) {
  return prisma.paymentMethod.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      userId: true,
      bank: true,
      cardBrand: true,
      cardAlias: true,
      maskedCard: true,
      isDefault: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { isDefault: 'desc' },
      { lastUsedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export function countPaymentMethodsByUserId(userId: string) {
  return prisma.paymentMethod.count({
    where: { userId, isActive: true },
  });
}

export function createPaymentMethod(params: {
  userId: string;
  bank: string;
  cardBrand: string;
  cardAlias?: string;
  maskedCard: string;
  providerToken: string;
  isDefault: boolean;
}) {
  return prisma.paymentMethod.create({
    data: {
      userId: params.userId,
      bank: params.bank,
      cardBrand: params.cardBrand,
      cardAlias: params.cardAlias,
      maskedCard: params.maskedCard,
      providerToken: params.providerToken,
      isDefault: params.isDefault,
    },
    select: {
      id: true,
      userId: true,
      bank: true,
      cardBrand: true,
      cardAlias: true,
      maskedCard: true,
      isDefault: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function findPaymentMethodByIdAndUserId(id: number, userId: string) {
  return prisma.paymentMethod.findFirst({
    where: { id, userId, isActive: true },
  });
}

export async function setDefaultPaymentMethod(userId: string, id: number) {
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    await tx.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  });
}

export async function markPaymentMethodUsed(userId: string, id: number) {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    await tx.paymentMethod.update({
      where: { id },
      data: {
        isDefault: true,
        lastUsedAt: now,
      },
    });
  });
}

export function deactivatePaymentMethod(id: number) {
  return prisma.paymentMethod.update({
    where: { id },
    data: { isActive: false, isDefault: false },
  });
}
