/**
 * High-level encrypt/decrypt helpers for the DM chat UI.
 *
 * In the trusted-server wire-encryption model, the server delivers
 * plaintext bodies via WS (already wire-decrypted) and decrypts
 * storage envelopes before returning REST history. These functions
 * are kept for backward compatibility with the API surface but are
 * now thin pass-throughs.
 */

// ── Decrypt ─────────────────────────────────────────────────────────────

export type DecryptedMessageResult = {
  body: string | null;
  encrypted?: boolean;
  id: string;
  needsRekey?: boolean;
  decryptedAttachment?: {
    key: string;
    nonce: string;
    originalName: string;
    originalType: string;
    originalSize: number;
  };
};

export async function decryptMessage(
  message: {
    id: string;
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
    senderId: string;
    recipientId?: string;
    createdAt?: string;
  },
  _ownUserId: string,
): Promise<DecryptedMessageResult> {
  // Server delivers plaintext body — no client-side decryption needed.
  return { body: message.body ?? "", id: message.id };
}

export async function decryptMessages(
  messages: Array<{
    id: string;
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
    senderId: string;
    recipientId?: string;
    createdAt?: string;
  }>,
  _ownUserId: string,
): Promise<Array<DecryptedMessageResult>> {
  return messages.map((m) => ({ body: m.body ?? "", id: m.id }));
}

export async function decryptConversationPreview(
  lastMessage: {
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
  } | null,
  _peerUserId: string,
  _ownUserId: string,
): Promise<string | Record<string, unknown>> {
  if (!lastMessage) return "";
  if (typeof lastMessage.body === "string") return lastMessage.body;
  return "";
}

// ── Device ID ────────────────────────────────────────────────────────────

const DEVICE_ID_KEY = "device-id";

export function getDeviceId(ownUserId: string): string {
  if (typeof window === "undefined") return "server";
  const key = `${DEVICE_ID_KEY}:${ownUserId}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Re-key ───────────────────────────────────────────────────────────────

export async function resetConversation(
  _ownUserId: string,
  _peerUserId: string,
): Promise<void> {
  // No-op — no client-side ratchet sessions to reset.
}

export async function tryRedecryptConversation(
  messages: Array<{
    id: string;
    body?: string | null;
    encrypted?: boolean;
  }>,
  _ownUserId: string,
): Promise<void> {
  // No-op — server delivers plaintext.
  void messages;
}
