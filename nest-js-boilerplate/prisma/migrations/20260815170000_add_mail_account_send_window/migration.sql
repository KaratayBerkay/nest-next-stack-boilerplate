-- AlterTable: local rolling-hour send-window tracking, so remaining headroom can be
-- estimated without calling MXRoute's own send-count API (which never reflects real sends).
ALTER TABLE "MailAccount" ADD COLUMN "firstSentAt" TIMESTAMPTZ(6);
ALTER TABLE "MailAccount" ADD COLUMN "lastSentAt" TIMESTAMPTZ(6);
