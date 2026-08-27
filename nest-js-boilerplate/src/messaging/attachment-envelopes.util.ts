import type { PrismaService } from '../prisma/prisma.service';
import type { MessageAttachment } from './messaging.types';

export interface AttachmentScope {
  kind: 'MESSAGES' | 'CHAT_ROOM';
  scopeId: string;
}

export interface ResolvedAttachments {
  attachments: MessageAttachment[];
  /**
   * Main-file + thumbnail urls that are safe to re-link (`PendingUpload.messageId`/
   * `roomMessageId`) to the message being saved — only ones whose `PendingUpload`
   * was uploaded by this sender and scoped to this exact conversation/room. Never
   * derive the relink set from the raw attachment list — that's what let a user
   * repoint someone else's upload onto their own message.
   */
  ownedUrls: string[];
}

/**
 * Resolves the at-rest storage envelope (v/ct/nonce) for each attachment from
 * the server-side PendingUpload store, keyed by the attachment `url` (the
 * R2 object the upload endpoint encrypted and persisted).
 *
 * Message payloads carried over WS/REST must stay lean — the full-file
 * ciphertext never rides a message frame — so the envelope a client echoes
 * back is only a backward-compat fallback; the store is authoritative. When
 * neither is available the envelope columns are written as NULL (the blob is
 * still encrypted at rest; the store row simply outlived a retry).
 *
 * A `PendingUpload` match is only trusted (hydrated + eligible for later
 * relinking) when it was uploaded by `senderId` and scoped to `scope` —
 * otherwise a user who merely saw someone else's attachment url in a message
 * they received could attach that same url to an unrelated message of their
 * own, silently repointing that upload's ownership.
 */
export async function resolveAttachmentEnvelopes(
  prisma: PrismaService,
  attachments: MessageAttachment[],
  senderId: string,
  scope: AttachmentScope,
): Promise<ResolvedAttachments> {
  if (!Array.isArray(attachments) || attachments.length === 0)
    return { attachments, ownedUrls: [] };

  const stores = await prisma.pendingUpload.findMany({
    where: { url: { in: attachments.map((a) => a.url) } },
  });
  const byUrl = new Map(stores.map((s) => [s.url, s]));

  const ownedUrls: string[] = [];
  const resolved = attachments.map((a) => {
    const stored = byUrl.get(a.url);
    if (!stored) return a;
    const owned =
      stored.uploadedBy === senderId &&
      stored.kind === scope.kind &&
      stored.scopeId === scope.scopeId;
    if (!owned) return a;
    ownedUrls.push(a.url);
    if (stored.thumbnailUrl) ownedUrls.push(stored.thumbnailUrl);
    return {
      ...a,
      size: stored.size,
      thumbnailUrl: stored.thumbnailUrl,
      storageEnvelope: {
        v: stored.v,
        nonce: stored.nonce,
        // PendingUpload.ct is nullable now that R2 is the sole copy of
        // ciphertext (rows created before the R2-backfill migration are the
        // only ones where it's still populated) — neither caller reads this
        // field anymore (see MessageAttachment/RoomMessageAttachment), but
        // the envelope shape stays as-is for now.
        ct: stored.ct ?? undefined,
      },
    };
  });
  return { attachments: resolved, ownedUrls };
}
