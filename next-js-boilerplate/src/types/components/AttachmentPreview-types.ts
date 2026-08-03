import type { AttachmentCryptoMetadata } from "@/lib/crypto/attachments";

export interface AttachmentPreviewProps {
  url: string;
  type?: string | null;
  name?: string | null;
  className?: string;
  /** When present, the attachment is encrypted and must be decrypted before display. */
  cryptoMetadata?: AttachmentCryptoMetadata;
}
