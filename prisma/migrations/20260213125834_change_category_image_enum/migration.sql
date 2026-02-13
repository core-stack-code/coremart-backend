/*
  Warnings:

  - The values [THUMBNAIL] on the enum `CategoryImageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CategoryImageType_new" AS ENUM ('ICON', 'BANNER');
ALTER TABLE "CategoryImage" ALTER COLUMN "type" TYPE "CategoryImageType_new" USING ("type"::text::"CategoryImageType_new");
ALTER TYPE "CategoryImageType" RENAME TO "CategoryImageType_old";
ALTER TYPE "CategoryImageType_new" RENAME TO "CategoryImageType";
DROP TYPE "public"."CategoryImageType_old";
COMMIT;
