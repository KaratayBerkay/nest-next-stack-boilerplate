-- DropTable: Remove RoomSenderKeyDistribution (replaced by per-session wire-crypto).
DROP TABLE "RoomSenderKeyDistribution";

-- AlterTable: Remove e2eeEnabled from User (no longer used).
ALTER TABLE "User" DROP COLUMN "e2eeEnabled";
