-- AlterTable
ALTER TABLE "MessageAttachment" ADD COLUMN "size" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoomMessageAttachment" ADD COLUMN "size" INTEGER NOT NULL DEFAULT 0;
