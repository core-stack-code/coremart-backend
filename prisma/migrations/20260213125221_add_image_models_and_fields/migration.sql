-- CreateEnum
CREATE TYPE "ProductImageType" AS ENUM ('THUMBNAIL', 'GALLERY');

-- CreateEnum
CREATE TYPE "CategoryImageType" AS ENUM ('THUMBNAIL', 'BANNER');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ProductImageType" NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryImage" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "type" "CategoryImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImage_productId_type_idx" ON "ProductImage"("productId", "type");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryImage_url_key" ON "CategoryImage"("url");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryImage" ADD CONSTRAINT "CategoryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
