import { AppError } from "@/server/lib/app-error";
import { BdoProviderAdapter } from "@/server/payments/providers/bdo.provider";
import { BpiProviderAdapter } from "@/server/payments/providers/bpi.provider";
import type { PaymentProviderAdapter, SupportedBank } from "@/server/payments/types";

export function getPaymentProvider(bank: string): PaymentProviderAdapter {
  const normalized = bank.toUpperCase() as SupportedBank;

  if (normalized === "BPI") return new BpiProviderAdapter();
  if (normalized === "BDO") return new BdoProviderAdapter();

  throw new AppError("지원하지 않는 결제 은행입니다.", 400);
}
