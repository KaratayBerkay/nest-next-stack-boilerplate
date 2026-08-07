-- AlterTable: server-generated preview object URL, set at upload time when
-- thumbnail generation succeeds (image/pdf/txt only). Null means "no
-- thumbnail" — the client falls back to the icon+name chip.
ALTER TABLE "MessageAttachment" ADD COLUMN "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "RoomMessageAttachment" ADD COLUMN "thumbnailUrl" TEXT;

-- AlterTable: URL of the *second* PendingUpload-backed object holding the
-- encrypted thumbnail bytes, resolved onto MessageAttachment/
-- RoomMessageAttachment by resolveAttachmentEnvelopes() at message-save time.
ALTER TABLE "PendingUpload" ADD COLUMN "thumbnailUrl" TEXT;
