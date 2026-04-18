-- Drop old Stripe unique indexes
DROP INDEX IF EXISTS "User_stripeCustomerId_key";
DROP INDEX IF EXISTS "User_stripeSubscriptionId_key";

-- Rename Stripe columns to Dodo columns (preserves any data)
ALTER TABLE "User" RENAME COLUMN "stripeCustomerId" TO "dodoCustomerId";
ALTER TABLE "User" RENAME COLUMN "stripeSubscriptionId" TO "dodoSubscriptionId";

-- Add new Pro subscription fields
ALTER TABLE "User" ADD COLUMN "proPlan" TEXT;
ALTER TABLE "User" ADD COLUMN "proExpiresAt" TIMESTAMP(3);

-- Recreate unique indexes on renamed columns
CREATE UNIQUE INDEX "User_dodoCustomerId_key" ON "User"("dodoCustomerId");
CREATE UNIQUE INDEX "User_dodoSubscriptionId_key" ON "User"("dodoSubscriptionId");
