/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_documentId_fkey";

-- DropTable
DROP TABLE "public"."Document";

-- CreateTable
CREATE TABLE "public"."Draft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cover" TEXT,
    "topic" TEXT,
    "intro" TEXT,
    "content" TEXT DEFAULT '',
    "private" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "character_count" INTEGER,
    "word_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Draft_private_created_at_idx" ON "public"."Draft"("private", "created_at");

-- CreateIndex
CREATE INDEX "Draft_authorId_created_at_idx" ON "public"."Draft"("authorId", "created_at");

-- CreateIndex
CREATE INDEX "Draft_title_idx" ON "public"."Draft"("title");

-- AddForeignKey
ALTER TABLE "public"."Draft" ADD CONSTRAINT "Draft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
