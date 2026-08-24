-- CreateEnum
CREATE TYPE "RtcRoomKind" AS ENUM ('CALL', 'MEETING', 'STREAM');

-- CreateEnum
CREATE TYPE "RtcRoomState" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "RtcParticipantRole" AS ENUM ('CALLER', 'CALLEE', 'HOST', 'COHOST', 'PARTICIPANT', 'BROADCASTER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CallEndState" AS ENUM ('RINGING', 'CONNECTING', 'CONNECTED', 'ENDED', 'REJECTED', 'FAILED', 'CANCELLED', 'MISSED');

-- CreateTable
CREATE TABLE "RtcRoom" (
    "id" UUID NOT NULL,
    "kind" "RtcRoomKind" NOT NULL,
    "state" "RtcRoomState" NOT NULL DEFAULT 'PENDING',
    "livekitRoomName" TEXT,
    "createdById" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(6),
    "endedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RtcRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RtcParticipant" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "RtcParticipantRole" NOT NULL,
    "livekitIdentity" TEXT,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(6),

    CONSTRAINT "RtcParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallSession" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "callerId" UUID NOT NULL,
    "calleeId" UUID NOT NULL,
    "state" "CallEndState" NOT NULL DEFAULT 'RINGING',
    "hasVideo" BOOLEAN NOT NULL DEFAULT true,
    "maxDurationMinutes" INTEGER,
    "ringingAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMPTZ(6),
    "endedAt" TIMESTAMPTZ(6),
    "endReason" TEXT,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "hostId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "maxDurationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveStream" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "broadcasterId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "peakViewerCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(6),

    CONSTRAINT "LiveStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RtcChatMessage" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "v" TEXT NOT NULL,
    "ct" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RtcChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RtcRoom_livekitRoomName_key" ON "RtcRoom"("livekitRoomName");

-- CreateIndex
CREATE INDEX "RtcRoom_kind_state_idx" ON "RtcRoom"("kind", "state");

-- CreateIndex
CREATE INDEX "RtcRoom_createdById_idx" ON "RtcRoom"("createdById");

-- CreateIndex
CREATE INDEX "RtcParticipant_roomId_leftAt_idx" ON "RtcParticipant"("roomId", "leftAt");

-- CreateIndex
CREATE INDEX "RtcParticipant_userId_idx" ON "RtcParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RtcParticipant_roomId_userId_key" ON "RtcParticipant"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_roomId_key" ON "CallSession"("roomId");

-- CreateIndex
CREATE INDEX "CallSession_callerId_ringingAt_idx" ON "CallSession"("callerId", "ringingAt" DESC);

-- CreateIndex
CREATE INDEX "CallSession_calleeId_ringingAt_idx" ON "CallSession"("calleeId", "ringingAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_roomId_key" ON "Meeting"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_slug_key" ON "Meeting"("slug");

-- CreateIndex
CREATE INDEX "Meeting_hostId_idx" ON "Meeting"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStream_roomId_key" ON "LiveStream"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStream_slug_key" ON "LiveStream"("slug");

-- CreateIndex
CREATE INDEX "LiveStream_isLive_startedAt_idx" ON "LiveStream"("isLive", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "LiveStream_broadcasterId_idx" ON "LiveStream"("broadcasterId");

-- CreateIndex
CREATE INDEX "RtcChatMessage_roomId_createdAt_idx" ON "RtcChatMessage"("roomId", "createdAt");

-- AddForeignKey
ALTER TABLE "RtcRoom" ADD CONSTRAINT "RtcRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcParticipant" ADD CONSTRAINT "RtcParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcParticipant" ADD CONSTRAINT "RtcParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_calleeId_fkey" FOREIGN KEY ("calleeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStream" ADD CONSTRAINT "LiveStream_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStream" ADD CONSTRAINT "LiveStream_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcChatMessage" ADD CONSTRAINT "RtcChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcChatMessage" ADD CONSTRAINT "RtcChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
