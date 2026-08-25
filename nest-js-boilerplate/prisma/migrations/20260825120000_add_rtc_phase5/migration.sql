-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MISSED_CALL';
ALTER TYPE "NotificationType" ADD VALUE 'MEETING_INVITE';
ALTER TYPE "NotificationType" ADD VALUE 'STREAM_LIVE';

-- CreateEnum
CREATE TYPE "RtcReportReason" AS ENUM ('HARASSMENT', 'SPAM', 'INAPPROPRIATE_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RtcRecordingStatus" AS ENUM ('NOT_STARTED', 'RECORDING', 'STOPPED');

-- CreateTable
CREATE TABLE "RtcReport" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "reportedUserId" UUID,
    "reason" "RtcReportReason" NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RtcReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RtcRecording" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "requestedById" UUID NOT NULL,
    "status" "RtcRecordingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "egressId" TEXT,
    "fileUrl" TEXT,
    "startedAt" TIMESTAMPTZ(6),
    "endedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RtcRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RtcReport_roomId_idx" ON "RtcReport"("roomId");

-- CreateIndex
CREATE INDEX "RtcReport_reporterId_idx" ON "RtcReport"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "RtcRecording_roomId_key" ON "RtcRecording"("roomId");

-- CreateIndex
CREATE INDEX "RtcRecording_roomId_idx" ON "RtcRecording"("roomId");

-- AddForeignKey
ALTER TABLE "RtcReport" ADD CONSTRAINT "RtcReport_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcReport" ADD CONSTRAINT "RtcReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcReport" ADD CONSTRAINT "RtcReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcRecording" ADD CONSTRAINT "RtcRecording_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RtcRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtcRecording" ADD CONSTRAINT "RtcRecording_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
