-- Add client-supplied retry key to WalletTransaction so a real retry (same
-- client UUID) can be recognized as a duplicate of a committed purchase,
-- independent of the invoice-derived idempotency key. See T75.
ALTER TABLE "WalletTransaction" ADD COLUMN "clientIdempotencyKey" TEXT;

CREATE INDEX "WalletTransaction_clientIdempotencyKey_idx" ON "WalletTransaction"("clientIdempotencyKey");
