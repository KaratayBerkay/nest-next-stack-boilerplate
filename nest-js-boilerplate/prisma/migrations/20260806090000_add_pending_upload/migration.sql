-- CreateTable
CREATE TABLE "PendingUpload" (
    "objectName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "v" TEXT NOT NULL,
    "ct" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "uploadedBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUpload_pkey" PRIMARY KEY ("objectName")
);
