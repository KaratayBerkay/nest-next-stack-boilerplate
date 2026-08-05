-- Message storage redesign:
--  * The at-rest envelope is no longer a JsonB `envelope` column — its
--    v/ct/nonce fields become dedicated columns (every message is encrypted).
--  * Unused columns are dropped: body (always NULL — no plaintext at rest),
--    encrypted (always true), algVersion (version now lives in `v`).
--  * Attachments move out of Message/RoomMessage into their own tables so a
--    single message can carry many uploads (one row per file).

-- Step 1 — Message: add v/ct/nonce, backfill from the envelope JSONB, then
-- enforce NOT NULL (all rows are encrypted; any legacy NULL envelope is a
-- loud failure rather than a silent plaintext row).

ALTER TABLE "Message" ADD COLUMN "v" TEXT, ADD COLUMN "ct" TEXT, ADD COLUMN "nonce" TEXT;

UPDATE "Message" SET
  "v" = envelope->>'v',
  "ct" = envelope->>'ct',
  "nonce" = envelope->>'nonce'
WHERE envelope IS NOT NULL;

-- Fail loudly if a legacy plaintext row (NULL envelope) exists — it cannot
-- satisfy the NOT NULL contract and must be handled before migrating.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Message" WHERE "v" IS NULL OR "ct" IS NULL OR "nonce" IS NULL) THEN
    RAISE EXCEPTION 'Message rows with NULL envelope found — cannot enforce NOT NULL v/ct/nonce; encrypt them first';
  END IF;
END $$;

ALTER TABLE "Message" ALTER COLUMN "v" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "ct" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "nonce" SET NOT NULL;

-- Step 2 — RoomMessage: same backfill.

ALTER TABLE "RoomMessage" ADD COLUMN "v" TEXT, ADD COLUMN "ct" TEXT, ADD COLUMN "nonce" TEXT;

UPDATE "RoomMessage" SET
  "v" = envelope->>'v',
  "ct" = envelope->>'ct',
  "nonce" = envelope->>'nonce'
WHERE envelope IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "RoomMessage" WHERE "v" IS NULL OR "ct" IS NULL OR "nonce" IS NULL) THEN
    RAISE EXCEPTION 'RoomMessage rows with NULL envelope found — cannot enforce NOT NULL v/ct/nonce; encrypt them first';
  END IF;
END $$;

ALTER TABLE "RoomMessage" ALTER COLUMN "v" SET NOT NULL;
ALTER TABLE "RoomMessage" ALTER COLUMN "ct" SET NOT NULL;
ALTER TABLE "RoomMessage" ALTER COLUMN "nonce" SET NOT NULL;

-- Step 3 — MessageAttachment table (many files per direct message).

CREATE TABLE "MessageAttachment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "v" TEXT,
    "ct" TEXT,
    "nonce" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- Backfill existing single-attachment rows into the new table.
INSERT INTO "MessageAttachment" ("id", "messageId", "url", "type", "name", "v", "ct", "nonce", "createdAt")
SELECT gen_random_uuid(), id, "attachmentUrl", "attachmentType", "attachmentName",
       "attachmentEnvelope"->>'v', "attachmentEnvelope"->>'ct', "attachmentEnvelope"->>'nonce',
       "createdAt"
FROM "Message"
WHERE "attachmentUrl" IS NOT NULL;

-- Step 4 — RoomMessageAttachment table.

CREATE TABLE "RoomMessageAttachment" (
    "id" UUID NOT NULL,
    "roomMessageId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "v" TEXT,
    "ct" TEXT,
    "nonce" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMessageAttachment_pkey" PRIMARY KEY ("id")
);

INSERT INTO "RoomMessageAttachment" ("id", "roomMessageId", "url", "type", "name", "v", "ct", "nonce", "createdAt")
SELECT gen_random_uuid(), id, "attachmentUrl", "attachmentType", "attachmentName",
       "attachmentEnvelope"->>'v', "attachmentEnvelope"->>'ct', "attachmentEnvelope"->>'nonce',
       "createdAt"
FROM "RoomMessage"
WHERE "attachmentUrl" IS NOT NULL;

-- Step 5 — indexes and FKs.

CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");
CREATE INDEX "RoomMessageAttachment_roomMessageId_idx" ON "RoomMessageAttachment"("roomMessageId");

ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoomMessageAttachment" ADD CONSTRAINT "RoomMessageAttachment_roomMessageId_fkey" FOREIGN KEY ("roomMessageId") REFERENCES "RoomMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6 — drop the superseded columns.

ALTER TABLE "Message" DROP COLUMN "body",
  DROP COLUMN "encrypted",
  DROP COLUMN "algVersion",
  DROP COLUMN "envelope",
  DROP COLUMN "attachmentUrl",
  DROP COLUMN "attachmentType",
  DROP COLUMN "attachmentName",
  DROP COLUMN "attachmentEnvelope";

ALTER TABLE "RoomMessage" DROP COLUMN "body",
  DROP COLUMN "encrypted",
  DROP COLUMN "algVersion",
  DROP COLUMN "envelope",
  DROP COLUMN "attachmentUrl",
  DROP COLUMN "attachmentType",
  DROP COLUMN "attachmentName",
  DROP COLUMN "attachmentEnvelope";
