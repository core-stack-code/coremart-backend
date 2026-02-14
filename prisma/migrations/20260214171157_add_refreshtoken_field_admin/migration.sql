/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_refreshToken_key" ON "Admin"("refreshToken");
