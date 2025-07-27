/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "likeCount",
ADD COLUMN     "intro" TEXT;
