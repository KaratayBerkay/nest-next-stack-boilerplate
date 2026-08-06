-- AlterTable
ALTER TABLE "PendingUpload" ADD COLUMN "size" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PendingUpload_uploadedBy_createdAt_idx" ON "PendingUpload"("uploadedBy", "createdAt");