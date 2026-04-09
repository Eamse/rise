export type SupportedBank = "BPI" | "BDO";

export type ChargeRequest = {
  orderId: number;
  amount: number;
  currency: "PHP";
  methodToken: string;
  userId: string;
  metadata?: Record<string, string>;
};

export type ChargeResult = {
  success: boolean;
  provider: SupportedBank;
  paymentKey: string;
  approvedAt?: string;
  rawStatus: string;
};

export interface PaymentProviderAdapter {
  readonly bank: SupportedBank;
  charge(input: ChargeRequest): Promise<ChargeResult>;
}
