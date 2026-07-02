-- Add device token column

-- Warn if pgcrypto is not available (needed for gen_random_bytes in the backfill).
-- If this fails, run: CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- On PostgreSQL 13+ gen_random_uuid() is built-in, but gen_random_bytes needs pgcrypto.

-- 1. Add column (nullable initially to backfill existing rows).
ALTER TABLE "Device" ADD COLUMN "token" TEXT;

-- 2. Backfill existing rows with a ≥90-char random token.
--    Uses only built-in md5() (no extension required).
--    id ensures uniqueness; random() + clock_timestamp() ensure per-row variety.
--    3 × md5 = 96 hex chars ≥ 90.
UPDATE "Device"
SET "token" = md5(id || random()::text)
           || md5(id || clock_timestamp()::text)
           || md5(random()::text || clock_timestamp()::text)
WHERE "token" IS NULL;

-- 3. Make it required.
ALTER TABLE "Device" ALTER COLUMN "token" SET NOT NULL;

-- 4. Add unique index (used for lookup).
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");
