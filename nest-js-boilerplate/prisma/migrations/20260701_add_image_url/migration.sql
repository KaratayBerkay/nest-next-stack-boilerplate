-- Add imageUrl column to Post and Comment
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
