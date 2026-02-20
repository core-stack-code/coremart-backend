/*
  Warnings:

  - The values [FAILED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `cfOrderId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orderCreatedAt` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentSessionId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('ACTIVE', 'PAID', 'EXPIRED', 'CANCELLED');
ALTER TABLE "public"."Payment" ALTER COLUMN "cfStatus" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "cfStatus" TYPE "PaymentStatus_new" USING ("cfStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "cfStatus" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "cfOrderId" SET NOT NULL,
ALTER COLUMN "orderCreatedAt" SET NOT NULL,
ALTER COLUMN "paymentSessionId" SET NOT NULL;
