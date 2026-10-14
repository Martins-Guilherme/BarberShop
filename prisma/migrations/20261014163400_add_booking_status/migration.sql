-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'finalized', 'confirmed', 'cancel');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "status" "BookingStatus" NOT NULL DEFAULT 'pending';

-- Preserve the behavior previously derived from the booking date.
UPDATE "Booking"
SET "status" = CASE
  WHEN "date" >= CURRENT_TIMESTAMP THEN 'confirmed'::"BookingStatus"
  ELSE 'finalized'::"BookingStatus"
END;
