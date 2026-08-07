export interface RoomMember {
  socketId: string;
  userId: string;
  name: string;
  /** Chat-room display-name override — prefer over `name` when present. */
  chatNickname?: string;
  /** Already withheld (null) server-side when the member's own hideAvatar is set. */
  avatarUrl?: string | null;
}

export interface MessageAttachment {
  /** Public URL from POST /upload/attachment */
  url: string;
  /** MIME type, e.g. "application/pdf" */
  type: string;
  /** Original file name, e.g. "report.pdf" */
  name: string;
  /** Decompressed file size in bytes (resolved from PendingUpload server-side). */
  size?: number;
  /** Small preview object URL, resolved from PendingUpload server-side. Null/absent when the type isn't thumbnailed or generation failed. */
  thumbnailUrl?: string | null;
  /** Server-side at-rest encryption metadata (ct omitted — too large for WS). */
  storageEnvelope?: { v: string; nonce: string; ct?: string } | null;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] || '?').toUpperCase();
}
