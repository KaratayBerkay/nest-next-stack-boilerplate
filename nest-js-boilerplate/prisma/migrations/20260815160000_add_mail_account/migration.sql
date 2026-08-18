-- CreateEnum
CREATE TYPE "MailAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateTable: sending mailboxes created on demand (e.g. via the MXRoute API) so
-- bulk sends can be spread across isolated per-account quotas instead of one shared inbox.
CREATE TABLE "MailAccount" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "encryptedPassword" BYTEA NOT NULL,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "status" "MailAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailAccount_email_key" ON "MailAccount"("email");

-- CreateIndex
CREATE INDEX "MailAccount_status_idx" ON "MailAccount"("status");
