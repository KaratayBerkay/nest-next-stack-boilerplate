-- CreateEnum
CREATE TYPE "UploadKind" AS ENUM ('MESSAGES', 'CHAT_ROOM');

-- AlterTable: trace where an upload landed in the R2 object tree and which
-- message it was eventually attached to. `kind`/`scopeId` are written at
-- upload time (client announces the scope via x-scope-kind / x-scope-id);
-- `messageId`/`roomMessageId` are backfilled by the messaging services when
-- the message is persisted.
ALTER TABLE "PendingUpload"
  ADD COLUMN "kind" "UploadKind" NOT NULL DEFAULT 'MESSAGES',
  ADD COLUMN "scopeId" TEXT,
  ADD COLUMN "filename" TEXT,
  ADD COLUMN "mimetype" TEXT,
  ADD COLUMN "messageId" UUID,
  ADD COLUMN "roomMessageId" UUID;

-- CreateIndex
CREATE INDEX "PendingUpload_kind_scopeId_createdAt_idx" ON "PendingUpload"("kind", "scopeId", "createdAt");