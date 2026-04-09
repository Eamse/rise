ALTER TABLE "PaymentMethod"
  RENAME COLUMN "provider" TO "bank";

ALTER TABLE "PaymentMethod"
  RENAME COLUMN "cardNumber" TO "maskedCard";

ALTER TABLE "PaymentMethod"
  ADD COLUMN "cardBrand" TEXT NOT NULL DEFAULT 'VISA',
  ADD COLUMN "cardAlias" TEXT,
  ADD COLUMN "providerToken" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastUsedAt" TIMESTAMP(3),
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "PaymentMethod"
SET "providerToken" = CONCAT('legacy_', "id", '_', EXTRACT(EPOCH FROM NOW())::BIGINT);

ALTER TABLE "PaymentMethod"
  ALTER COLUMN "providerToken" SET NOT NULL;

CREATE UNIQUE INDEX "PaymentMethod_providerToken_key" ON "PaymentMethod"("providerToken");
