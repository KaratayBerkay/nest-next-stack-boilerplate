-- 2026-09-03: drop schema that no application code ever referenced (issues.md BE-008,
-- BE-014, BE-026, BE-027, BE-028 — every dropped column/table was verified empty in the
-- live database first) and add the RoomMessage reply/delete columns for CROSS-024.
-- Generated with `prisma migrate diff --from-config-datasource --to-schema`.
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('COMMENT', 'REACTION', 'FRIEND_REQUEST', 'POST', 'BILLING', 'SECURITY', 'MISSED_CALL', 'MEETING_INVITE', 'STREAM_LIVE');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referredById_fkey";

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_B_fkey";

-- DropIndex
DROP INDEX "Post_categoryId_idx";

-- DropIndex
DROP INDEX "User_phoneNumber_key";

-- DropIndex
DROP INDEX "User_referredById_idx";

-- AlterTable
ALTER TABLE "MfaFactor" DROP COLUMN "counter",
DROP COLUMN "credentialId",
DROP COLUMN "publicKey",
DROP COLUMN "transports";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "RoomMessage" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "replyToId" UUID;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthDate",
DROP COLUMN "interests",
DROP COLUMN "metadata",
DROP COLUMN "phoneNumber",
DROP COLUMN "phoneVerified",
DROP COLUMN "preferences",
DROP COLUMN "quietHoursStart",
DROP COLUMN "referredById",
DROP COLUMN "reputation";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Follow";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_PostToTag";

-- CreateTable
CREATE TABLE "RoomMessageDeletion" (
    "id" UUID NOT NULL,
    "roomMessageId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMessageDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomMessageDeletion_userId_idx" ON "RoomMessageDeletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMessageDeletion_roomMessageId_userId_key" ON "RoomMessageDeletion"("roomMessageId", "userId");

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "RoomMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessageDeletion" ADD CONSTRAINT "RoomMessageDeletion_roomMessageId_fkey" FOREIGN KEY ("roomMessageId") REFERENCES "RoomMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessageDeletion" ADD CONSTRAINT "RoomMessageDeletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

