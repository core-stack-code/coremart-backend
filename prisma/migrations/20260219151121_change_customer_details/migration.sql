/*
  Warnings:

  - You are about to drop the column `note` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerDetails" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "note";
