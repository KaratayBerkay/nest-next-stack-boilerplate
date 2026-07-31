-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "attachmentType" TEXT,
ADD COLUMN     "attachmentName" TEXT;

-- AlterTable
ALTER TABLE "RoomMessage" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "attachmentType" TEXT,
ADD COLUMN     "attachmentName" TEXT;
