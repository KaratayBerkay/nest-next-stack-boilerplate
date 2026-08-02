-- AlterTable
ALTER TABLE "User" ADD COLUMN     "useNickname" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: preserve current behavior for users who already had a nickname
-- saved under the old scheme (presence of chatNickname text == "in use").
UPDATE "User" SET "useNickname" = true WHERE "chatNickname" IS NOT NULL AND "chatNickname" <> '';
