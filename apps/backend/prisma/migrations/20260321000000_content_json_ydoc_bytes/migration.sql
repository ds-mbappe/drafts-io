-- Change content column from TEXT to JSONB
-- NOTE: If existing rows have HTML/plain-text values they must be cleared or
-- converted before running this migration.
-- Safe for empty/fresh databases; for production data, manually migrate content first.
ALTER TABLE "Draft" ALTER COLUMN "content" DROP DEFAULT;
ALTER TABLE "Draft" ALTER COLUMN "content" TYPE JSONB USING NULL::JSONB;

-- Add ydoc binary column for Y.Doc state snapshots
ALTER TABLE "Draft" ADD COLUMN "ydoc" BYTEA;
