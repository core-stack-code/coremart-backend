-- DropIndex
DROP INDEX "WishList_userId_key";

-- CreateIndex
CREATE INDEX "WishList_userId_idx" ON "WishList"("userId");
