-- Make password nullable for SSO users
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- Settings verification fields
ALTER TABLE "users" ADD COLUMN "pendingEmail" TEXT;
ALTER TABLE "users" ADD COLUMN "changeEmailCode" TEXT;
ALTER TABLE "users" ADD COLUMN "changeEmailCodeExpiry" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "changePasswordCode" TEXT;
ALTER TABLE "users" ADD COLUMN "changePasswordCodeExpiry" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
