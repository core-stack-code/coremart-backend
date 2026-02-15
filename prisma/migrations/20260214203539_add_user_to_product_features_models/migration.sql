-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePictureUrl" TEXT;

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteProduct" (
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WishList" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishListItem" (
    "wishListId" UUID NOT NULL,
    "productId" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "UserAddress_userId_isDefault_idx" ON "UserAddress"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "UserAddress_userId_addressLine1_city_state_postalCode_count_key" ON "UserAddress"("userId", "addressLine1", "city", "state", "postalCode", "country");

-- CreateIndex
CREATE INDEX "FavoriteProduct_userId_idx" ON "FavoriteProduct"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProduct_userId_productId_key" ON "FavoriteProduct"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishList_userId_key" ON "WishList"("userId");

-- CreateIndex
CREATE INDEX "WishListItem_wishListId_idx" ON "WishListItem"("wishListId");

-- CreateIndex
CREATE UNIQUE INDEX "WishListItem_wishListId_productId_key" ON "WishListItem"("wishListId", "productId");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProduct" ADD CONSTRAINT "FavoriteProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProduct" ADD CONSTRAINT "FavoriteProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishList" ADD CONSTRAINT "WishList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishListItem" ADD CONSTRAINT "WishListItem_wishListId_fkey" FOREIGN KEY ("wishListId") REFERENCES "WishList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishListItem" ADD CONSTRAINT "WishListItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
