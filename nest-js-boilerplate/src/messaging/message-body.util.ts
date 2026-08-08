import type { StorageCryptoService } from '../wire-crypto/storage-crypto.service';

/**
 * Decrypt a storage envelope in-place so callers receive plaintext bodies
 * instead of raw ciphertext. The envelope is rebuilt from the flattened
 * v/ct/nonce columns (there is no JsonB envelope column anymore). Shared by
 * the REST controller, the GraphQL resolver, and the `Message.body`
 * @ResolveField so all three surfaces decrypt identically.
 *
 * A message flagged `deletedAt` ("delete for everyone") is a tombstone: its
 * ciphertext is never decrypted or exposed, regardless of who's asking.
 */
export function decryptMessageBody(
  message: Record<string, unknown>,
  userId: string,
  storageCrypto: StorageCryptoService,
): Record<string, unknown> {
  if (message.deletedAt) {
    const { v: _v, ct: _ct, nonce: _nonce, ...rest } = message;
    return { ...rest, body: null, attachments: [] };
  }
  const envelope = storageCrypto.toEnvelope(
    message as {
      v: string | null;
      ct: string | null;
      nonce: string | null;
    },
  );
  if (!envelope) return message;
  const { v: _v, ct: _ct, nonce: _nonce, ...rest } = message;
  const attempt = (
    decrypt: (e: unknown) => unknown,
  ): Record<string, unknown> | null => {
    try {
      const decrypted = decrypt(envelope) as {
        text?: string;
        attachments?: unknown;
      };
      return { ...rest, body: decrypted.text ?? '' };
    } catch {
      return null;
    }
  };
  return (
    // Room key first (room messages use encryptForRoom).
    attempt((e) => storageCrypto.decryptForRoom(e)) ??
    // Then the sender's per-user key (legacy room messages or DMs
    // encrypted with encryptForStorage(senderId, ...)).
    attempt((e) =>
      storageCrypto.decryptFromStorage(
        (message.senderId as string) || userId,
        e,
      ),
    ) ??
    // Last resort: reader's per-user key (DMs where reader is sender).
    attempt((e) => storageCrypto.decryptFromStorage(userId, e)) ??
    message
  );
}
