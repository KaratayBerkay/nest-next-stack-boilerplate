import type { AttachmentCryptoMetadata } from "@/lib/crypto/attachments";

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  /** Server-side at-rest encryption envelope for this attachment blob. */
  storageEnvelope?: { v: string; nonce: string; ct: string } | null;
  /** Present when the attachment blob is encrypted (legacy E2EE). */
  cryptoMetadata?: AttachmentCryptoMetadata;
}
