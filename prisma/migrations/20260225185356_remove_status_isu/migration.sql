/*
  Warnings:

  - You are about to drop the column `status` on the `isu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "isu" DROP COLUMN "status";

-- DropEnum
DROP TYPE "StatusIsu";
