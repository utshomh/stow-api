/*
  Warnings:

  - The `allowedFileTypes` column on the `SubscriptionPackage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPackage" DROP COLUMN "allowedFileTypes",
ADD COLUMN     "allowedFileTypes" TEXT[];

-- DropEnum
DROP TYPE "FileType";
