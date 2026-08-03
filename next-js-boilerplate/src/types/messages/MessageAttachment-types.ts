import type { AttachmentCryptoMetadata } from "@/lib/crypto/attachments";

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  /** Present when the attachment blob is encrypted (E2EE). */
  cryptoMetadata?: AttachmentCryptoMetadata;
}
