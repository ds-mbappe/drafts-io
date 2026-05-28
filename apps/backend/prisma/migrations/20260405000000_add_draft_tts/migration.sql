-- CreateTable
CREATE TABLE "DraftTts" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "chunks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DraftTts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftTts_draftId_idx" ON "DraftTts"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftTts_draftId_contentHash_key" ON "DraftTts"("draftId", "contentHash");

-- AddForeignKey
ALTER TABLE "DraftTts" ADD CONSTRAINT "DraftTts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
