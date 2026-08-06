import type { PrismaService } from '../prisma/prisma.service';
import type { MessageAttachment } from './messaging.types';

/**
 * Resolves the at-rest storage envelope (v/ct/nonce) for each attachment from
 * the server-side PendingUpload store, keyed by the attachment `url` (the
 * MinIO object the upload endpoint encrypted and persisted).
 *
 * Message payloads carried over WS/REST must stay lean — the full-file
 * ciphertext never rides a message frame — so the envelope a client echoes
 * back is only a backward-compat fallback; the store is authoritative. When
 * neither is available the envelope columns are written as NULL (the blob is
 * still encrypted at rest; the store row simply outlived a retry).
 */
export async function resolveAttachmentEnvelopes(
  prisma: PrismaService,
  attachments: MessageAttachment[],
): Promise<MessageAttachment[]> {
  if (!Array.isArray(attachments) || attachments.length === 0)
    return attachments;

  const stores = await prisma.pendingUpload.findMany({
    where: { url: { in: attachments.map((a) => a.url) } },
  });
  const byUrl = new Map(stores.map((s) => [s.url, s]));

  return attachments.map((a) => {
    const stored = byUrl.get(a.url);
    if (!stored) return a;
    return {
      ...a,
      size: stored.size,
      storageEnvelope: {
        v: stored.v,
        nonce: stored.nonce,
        ct: stored.ct,
      },
    };
  });
}