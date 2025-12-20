-- CreateIndex
CREATE INDEX "Document_private_created_at_idx" ON "public"."Document"("private", "created_at");

-- CreateIndex
CREATE INDEX "Document_authorId_created_at_idx" ON "public"."Document"("authorId", "created_at");

-- CreateIndex
CREATE INDEX "Document_title_idx" ON "public"."Document"("title");
