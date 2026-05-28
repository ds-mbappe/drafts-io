CREATE TABLE "DraftTranslation" (
    "id"          TEXT        NOT NULL,
    "draftId"     TEXT        NOT NULL,
    "userId"      TEXT        NOT NULL,
    "language"    TEXT        NOT NULL,
    "content"     JSONB       NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DraftTranslation_draftId_userId_language_key"
    ON "DraftTranslation"("draftId", "userId", "language");

CREATE INDEX "DraftTranslation_draftId_userId_idx"
    ON "DraftTranslation"("draftId", "userId");

ALTER TABLE "DraftTranslation"
    ADD CONSTRAINT "DraftTranslation_draftId_fkey"
    FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DraftTranslation"
    ADD CONSTRAINT "DraftTranslation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
