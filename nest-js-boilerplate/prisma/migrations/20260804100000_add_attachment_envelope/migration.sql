-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachmentEnvelope" JSONB;

-- AlterTable
ALTER TABLE "RoomMessage" ADD COLUMN "attachmentEnvelope" JSONB;
