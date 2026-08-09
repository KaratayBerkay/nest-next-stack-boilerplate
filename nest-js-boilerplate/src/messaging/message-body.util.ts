import type { StorageCryptoService } from '../wire-crypto/storage-crypto.service';

/**
 * Decrypts just the body/attachments of one message row — the logic
 * `decryptMessageBody` used to be, before it also learned to resolve a
 * nested `replyTo` preview (see below). Split out so `buildReplyPreview` can
 * call it on a reply target without re-triggering reply-preview resolution
 * a second time (the nested row never itself carries a `replyTo` key, since
 * no query in this codebase includes a reply's reply, but keeping the two
 * concerns in separate functions makes that boundary explicit instead of
 * incidental).
 *
 * A message flagged `deletedAt` ("delete for everyone") is a tombstone: its
 * ciphertext is never decrypted or exposed, regardless of who's asking.
 */
function resolveBody(
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

export interface ReplyPreviewData {
  id: string;
  senderId: string;
  body: string | null;
  deletedAt: string | null;
  hasAttachments: boolean;
}

/**
 * Builds the small quoted-reply shape shown above a message's content —
 * used identically by REST (via `decryptMessageBody` below), the GraphQL
 * `Message.replyTo` field resolver, and the WS delivery payload. `replyTo`
 * must already carry its own `v`/`ct`/`nonce`/`attachments` (callers fetch
 * it via a one-level-deep Prisma `include`); a deeper `replyTo.replyTo` is
 * never fetched, so this never recurses past one level.
 */
export function buildReplyPreview(
  replyTo: Record<string, unknown> | null | undefined,
  userId: string,
  storageCrypto: StorageCryptoService,
): ReplyPreviewData | null {
  if (!replyTo) return null;
  const decrypted = resolveBody(replyTo, userId, storageCrypto);
  const attachments = (replyTo.attachments as unknown[] | undefined) ?? [];
  return {
    id: replyTo.id as string,
    senderId: replyTo.senderId as string,
    body: (decrypted.body as string | null) ?? null,
    deletedAt: replyTo.deletedAt
      ? new Date(replyTo.deletedAt as string | Date).toISOString()
      : null,
    hasAttachments: !replyTo.deletedAt && attachments.length > 0,
  };
}

/**
 * Decrypt a storage envelope in-place so callers receive plaintext bodies
 * instead of raw ciphertext, and — when the row was fetched with its
 * `replyTo` relation included — resolve that into a decrypted preview too.
 * Shared by the REST controller, the GraphQL resolver, and the
 * `Message.body`/`Message.replyTo` @ResolveFields so all three surfaces
 * decrypt identically.
 */
export function decryptMessageBody(
  message: Record<string, unknown>,
  userId: string,
  storageCrypto: StorageCryptoService,
): Record<string, unknown> {
  const resolved = resolveBody(message, userId, storageCrypto);
  if (!('replyTo' in message)) return resolved;
  return {
    ...resolved,
    replyTo: buildReplyPreview(
      message.replyTo as Record<string, unknown> | null,
      userId,
      storageCrypto,
    ),
  };
}
