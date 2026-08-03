/**
 * Attachment encryption for E2EE (§1.7, §5 of the plan).
 *
 * Before upload to MinIO, the file bytes are encrypted with XChaCha20-Poly1305.
 * The symmetric key + nonce + original metadata travel inside the message's
 * encrypted envelope — the server never sees plaintext file content, filename,
 * or MIME type for encrypted attachments.
 */

import { xchachaEncrypt, xchachaDecrypt } from "./primitives.js";
import type { MessagePlaintextV1 } from "./types.js";

// ── Types ──────────────────────────────────────────────────────────────

export interface EncryptedAttachment {
  /** URL of the encrypted blob in MinIO (server-generated). */
  url: string;
  /** Original filename (stored in envelope, not on server). */
  originalName: string;
  /** Original MIME type (stored in envelope, not on server). */
  originalType: string;
  /** Original file size in bytes. */
  originalSize: number;
}

export interface AttachmentCryptoMetadata {
  /** Symmetric key (hex) used to encrypt the attachment blob. */
  key: string;
  /** Nonce (base64) used for encryption. */
  nonce: string;
  /** Original filename. */
  originalName: string;
  /** Original MIME type. */
  originalType: string;
  /** Original file size in bytes. */
  originalSize: number;
}

// ── Encrypt ────────────────────────────────────────────────────────────

/**
 * Encrypt a File's bytes for encrypted upload.
 * Returns the encrypted blob as a new File ready for upload, plus the
 * crypto metadata to embed in the message envelope.
 */
export async function encryptAttachmentForUpload(
  file: File,
): Promise<{ encryptedBlob: File; metadata: AttachmentCryptoMetadata }> {
  const plaintextBytes = new Uint8Array(await file.arrayBuffer());

  // Generate a random symmetric key for this attachment
  const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
  const symmetricKeyHex = Array.from(symmetricKey)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { ciphertext, nonce } = xchachaEncrypt(symmetricKeyHex, plaintextBytes);

  // Build the encrypted blob as a File (preserves original name for debugging)
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), (c) =>
    c.charCodeAt(0),
  );
  const encryptedBlob = new File([ciphertextBytes], file.name, {
    type: "application/octet-stream",
  });

  const metadata: AttachmentCryptoMetadata = {
    key: symmetricKeyHex,
    nonce,
    originalName: file.name,
    originalType: file.type,
    originalSize: file.size,
  };

  return { encryptedBlob, metadata };
}

// ── Decrypt ────────────────────────────────────────────────────────────

/**
 * Decrypt an encrypted attachment blob fetched from MinIO.
 * The key and nonce come from the message's decrypted envelope.
 */
export async function decryptAttachment(
  encryptedUrl: string,
  metadata: AttachmentCryptoMetadata,
): Promise<Blob> {
  const res = await fetch(encryptedUrl);
  if (!res.ok)
    throw new Error(`Failed to fetch encrypted attachment: ${res.status}`);

  const ciphertextBytes = new Uint8Array(await res.arrayBuffer());
  const ciphertextB64 = btoa(String.fromCharCode(...ciphertextBytes));

  const plaintext = xchachaDecrypt(metadata.key, ciphertextB64, metadata.nonce);

  // Copy into a plain ArrayBuffer to satisfy BlobPart constraint
  const buf = new ArrayBuffer(plaintext.length);
  new Uint8Array(buf).set(plaintext);
  return new Blob([buf], { type: metadata.originalType });
}

/**
 * Decrypt an encrypted attachment and create an object URL for display.
 */
export async function decryptAttachmentToObjectUrl(
  encryptedUrl: string,
  metadata: AttachmentCryptoMetadata,
): Promise<string> {
  const blob = await decryptAttachment(encryptedUrl, metadata);
  return URL.createObjectURL(blob);
}

// ── Envelope helpers ───────────────────────────────────────────────────

/**
 * Build the attachment metadata object for inclusion in MessagePlaintextV1.
 */
export function buildAttachmentPlaintext(
  metadata: AttachmentCryptoMetadata,
): MessagePlaintextV1["attachment"] {
  return {
    key: metadata.key,
    nonce: metadata.nonce,
    originalName: metadata.originalName,
    originalType: metadata.originalType,
    originalSize: metadata.originalSize,
  };
}

/**
 * Extract AttachmentCryptoMetadata from a decrypted MessagePlaintextV1.
 */
export function extractAttachmentMetadata(
  plaintext: MessagePlaintextV1,
): AttachmentCryptoMetadata | null {
  if (!plaintext.attachment) return null;
  return {
    key: plaintext.attachment.key,
    nonce: plaintext.attachment.nonce,
    originalName: plaintext.attachment.originalName,
    originalType: plaintext.attachment.originalType,
    originalSize: plaintext.attachment.originalSize,
  };
}
