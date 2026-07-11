-- GIN trigram index for substring search on post content (complements title index)
CREATE INDEX "Post_content_trgm_idx" ON "Post" USING gin (
  content gin_trgm_ops
);
