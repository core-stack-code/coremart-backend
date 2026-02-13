-- CreateIndex
CREATE INDEX "CategoryImage_categoryId_type_idx" ON "CategoryImage"("categoryId", "type");

-- CreateIndex
CREATE INDEX "CategoryImage_categoryId_idx" ON "CategoryImage"("categoryId");
