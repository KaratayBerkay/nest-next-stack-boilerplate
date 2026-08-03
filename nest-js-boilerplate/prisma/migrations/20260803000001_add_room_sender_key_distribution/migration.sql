-- CreateTable
CREATE TABLE "RoomSenderKeyDistribution" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "senderDeviceId" UUID NOT NULL,
    "epoch" INTEGER NOT NULL,
    "recipientDeviceId" UUID NOT NULL,
    "wrappedKey" BYTEA NOT NULL,
    "wrapNonce" BYTEA NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomSenderKeyDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomSenderKeyDistribution_roomId_senderDeviceId_epoch_recipient_key" ON "RoomSenderKeyDistribution"("roomId", "senderDeviceId", "epoch", "recipientDeviceId");

-- CreateIndex
CREATE INDEX "RoomSenderKeyDistribution_roomId_recipientDeviceId_idx" ON "RoomSenderKeyDistribution"("roomId", "recipientDeviceId");

-- AddForeignKey
ALTER TABLE "RoomSenderKeyDistribution" ADD CONSTRAINT "RoomSenderKeyDistribution_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
