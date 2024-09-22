/*
  Warnings:

  - A unique constraint covering the columns `[id,avatar,firstname,lastname]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_authorId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "authorAvatar" TEXT,
ADD COLUMN     "authorFirstname" TEXT,
ADD COLUMN     "authorLastname" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_id_avatar_firstname_lastname_key" ON "users"("id", "avatar", "firstname", "lastname");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_authorAvatar_authorFirstname_authorLastn_fkey" FOREIGN KEY ("authorId", "authorAvatar", "authorFirstname", "authorLastname") REFERENCES "users"("id", "avatar", "firstname", "lastname") ON DELETE SET NULL ON UPDATE CASCADE;
