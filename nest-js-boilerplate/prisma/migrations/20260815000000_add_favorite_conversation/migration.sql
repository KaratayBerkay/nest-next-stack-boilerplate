-- CreateTable: one row per (user, peer) the user has starred. One-
-- directional — favoriting a conversation never affects the peer's view.
CREATE TABLE "FavoriteConversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "peerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteConversation_userId_peerId_key" ON "FavoriteConversation"("userId", "peerId");

-- CreateIndex
CREATE INDEX "FavoriteConversation_userId_idx" ON "FavoriteConversation"("userId");

-- AddForeignKey
ALTER TABLE "FavoriteConversation" ADD CONSTRAINT "FavoriteConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteConversation" ADD CONSTRAINT "FavoriteConversation_peerId_fkey" FOREIGN KEY ("peerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
