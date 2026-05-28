-- Drop both possible column names to cover all states
ALTER TABLE "Draft" DROP COLUMN IF EXISTS "topics";
ALTER TABLE "Draft" DROP COLUMN IF EXISTS "topic";

-- Re-add as a clean TEXT[] column
ALTER TABLE "Draft" ADD COLUMN "topics" TEXT[] NOT NULL DEFAULT '{}';
