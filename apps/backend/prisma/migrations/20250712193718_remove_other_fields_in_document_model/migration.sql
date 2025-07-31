/*
  Warnings:

  - You are about to drop the column `authorAvatar` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `authorFirstname` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `authorLastname` on the `Document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_authorId_authorAvatar_authorFirstname_authorLastn_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "authorAvatar",
DROP COLUMN "authorFirstname",
DROP COLUMN "authorLastname";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
