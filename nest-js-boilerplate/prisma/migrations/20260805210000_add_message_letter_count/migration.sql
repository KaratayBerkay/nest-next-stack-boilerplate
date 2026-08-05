-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "letterCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoomMessage" ADD COLUMN     "letterCount" INTEGER NOT NULL DEFAULT 0;
