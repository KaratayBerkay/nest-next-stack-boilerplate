-- AlterTable: Add storage-level encryption columns to Message and RoomMessage.
-- These columns were defined in schema.prisma but never migrated (fresh-install bug).

ALTER TABLE "Message" ADD COLUMN "encrypted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Message" ADD COLUMN "algVersion" INTEGER;
ALTER TABLE "Message" ADD COLUMN "envelope" JSONB;

ALTER TABLE "RoomMessage" ADD COLUMN "encrypted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RoomMessage" ADD COLUMN "algVersion" INTEGER;
ALTER TABLE "RoomMessage" ADD COLUMN "envelope" JSONB;
