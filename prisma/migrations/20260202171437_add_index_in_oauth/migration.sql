-- CreateIndex
CREATE INDEX "OAuthAccount_userId_provider_idx" ON "OAuthAccount"("userId", "provider");
