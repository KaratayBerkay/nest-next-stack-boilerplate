-- AlterTable
ALTER TABLE "MessageAttachment" DROP COLUMN "v",
DROP COLUMN "ct",
DROP COLUMN "nonce";

-- AlterTable
ALTER TABLE "RoomMessageAttachment" DROP COLUMN "v",
DROP COLUMN "ct",
DROP COLUMN "nonce";
