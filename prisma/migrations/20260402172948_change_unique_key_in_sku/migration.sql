/*
  Warnings:

  - A unique constraint covering the columns `[skuCode,variantId]` on the table `SKU` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SKU_skuCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "SKU_skuCode_variantId_key" ON "SKU"("skuCode", "variantId");
