/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OtpSession_userId_sessionType_idx";

-- CreateIndex
CREATE INDEX "OtpSession_userId_sessionType_isUsed_idx" ON "OtpSession"("userId", "sessionType", "isUsed");

-- CreateIndex
CREATE INDEX "OtpSession_userId_sessionType_otpExpiresAt_idx" ON "OtpSession"("userId", "sessionType", "otpExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "Session_userId_createdAt_idx" ON "Session"("userId", "createdAt");
