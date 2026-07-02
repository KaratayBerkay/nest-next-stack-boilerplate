CREATE TABLE "PushSubscription" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "endpoint"  TEXT NOT NULL,
    "p256dh"    TEXT NOT NULL,
    "auth"      TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
