/*
  Warnings:

  - A unique constraint covering the columns `[orderUid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderUid` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "orderUid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderUid_key" ON "Payment"("orderUid");

-- CreateIndex
CREATE INDEX "Payment_orderUid_idx" ON "Payment"("orderUid");
