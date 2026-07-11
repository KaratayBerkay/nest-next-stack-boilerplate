-- Add updatedAt to OutboxEvent for stale PUBLISHING reclaim
ALTER TABLE "OutboxEvent" ADD COLUMN "updatedAt" timestamptz(6) NOT NULL DEFAULT now();

-- Index for the stale-PUBLISHING reclaim query
CREATE INDEX "OutboxEvent_status_updatedAt_idx" ON "OutboxEvent"("status", "updatedAt");

-- Enable pg_trgm extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index for substring search on post title/content
CREATE INDEX "Post_title_content_trgm_idx" ON "Post" USING gin (
  title gin_trgm_ops
);
