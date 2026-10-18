-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected', 'expired', 'refunded');

-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "paymentAmount" DECIMAL(10,2),
ADD COLUMN "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN "mercadoPagoPreferenceId" TEXT,
ADD COLUMN "mercadoPagoPaymentId" TEXT,
ADD COLUMN "checkoutUrl" TEXT;

-- Preserve existing bookings created before payments were introduced.
UPDATE "Booking" AS booking
SET
  "paymentStatus" = 'approved',
  "paymentAmount" = service."price"
FROM "BarbershopService" AS service
WHERE service."id" = booking."serviceId";

ALTER TABLE "Booking"
ALTER COLUMN "paymentAmount" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_mercadoPagoPreferenceId_key"
ON "Booking"("mercadoPagoPreferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_mercadoPagoPaymentId_key"
ON "Booking"("mercadoPagoPaymentId");
