-- Add composite index for notification list queries ordered by createdAt DESC
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification" ("userId", "createdAt" DESC);
