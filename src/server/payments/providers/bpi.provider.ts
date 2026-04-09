import crypto from "crypto";
import type {
  ChargeRequest,
  ChargeResult,
  PaymentProviderAdapter,
} from "@/server/payments/types";

export class BpiProviderAdapter implements PaymentProviderAdapter {
  readonly bank = "BPI" as const;

  async charge(input: ChargeRequest): Promise<ChargeResult> {
    const seed = `${input.orderId}:${input.amount}:${input.methodToken}:${Date.now()}`;
    const paymentKey = `bpi_${crypto.createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;

    return {
      success: true,
      provider: this.bank,
      paymentKey,
      approvedAt: new Date().toISOString(),
      rawStatus: "APPROVED",
    };
  }
}
