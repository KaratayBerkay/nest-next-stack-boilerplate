-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingTier" "SubscriptionTier",
ADD COLUMN     "pendingTierEffectiveAt" TIMESTAMPTZ(6),
ADD COLUMN     "stripeSubscriptionScheduleId" TEXT;
