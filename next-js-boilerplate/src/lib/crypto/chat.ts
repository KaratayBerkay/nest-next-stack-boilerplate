/**
 * High-level encrypt/decrypt helpers for the DM chat UI.
 *
 * These functions sit between the data layer (API/WS) and the rendering
 * components, following the plan's principle: "decrypt at the boundary,
 * keep every rendering component ciphertext-naive."
 */

import type {
  DeviceIdentity,
  DeviceBundle,
  MessageEnvelopeV1,
  MessagePlaintextV1,
} from "./types";
import { claimBundleServer } from "@/api/server/e2ee/claim-bundle";
import type { AttachmentCryptoMetadata } from "./attachments";
import { getE2eeEnabled } from "./e2ee-preference";
import {
  cacheDecryptedMessage,
  getCachedDecryptedMessagesMap,
  type CachedDecryptedMessage,
} from "./store";

// ── Feature flag ────────────────────────────────────────────────────────

/**
 * Whether THIS device should encrypt messages it sends — the current
 * user's own Settings > Privacy preference (default on). Does not gate
 * decryption: incoming messages are always decrypted when possible,
 * regardless of the viewer's own send preference.
 */
export function isE2eeDmEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return getE2eeEnabled();
}

// ── Encrypt ─────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext message for a DM recipient.
 *
 * Fetches the recipient's prekey bundle from the server (consuming one OPK
 * on first contact), then performs X3DH + Double Ratchet encryption.
 *
 * Returns the envelope to store in Message.envelope on the server, and the
 * plaintext for the optimistic cache.
 */
export async function encryptForSend(
  ownUserId: string,
  text: string,
  recipientUserId: string,
  attachmentMetadata?: AttachmentCryptoMetadata,
): Promise<{ envelope: MessageEnvelopeV1; plaintext: MessagePlaintextV1 }> {
  const { encryptDmMessage } = await import("./envelope");

  // Get or generate our device identity
  const deviceId = getDeviceId(ownUserId);
  const { identity, signingPrivateKey, agreementPrivateKey } =
    await getIdentityWithPrivateKeys(ownUserId, deviceId);

  // Fetch recipient's prekey bundle
  const {
    bundle,
    deviceId: peerDeviceId,
    oneTimePrekey,
  } = await claimBundleServer(recipientUserId);

  const plaintext: MessagePlaintextV1 = { text };
  if (attachmentMetadata) {
    plaintext.attachment = {
      key: attachmentMetadata.key,
      nonce: attachmentMetadata.nonce,
      originalName: attachmentMetadata.originalName,
      originalType: attachmentMetadata.originalType,
      originalSize: attachmentMetadata.originalSize,
    };
  }

  const { envelope } = await encryptDmMessage(
    ownUserId,
    plaintext,
    {
      identity,
      signingPrivateKey,
      agreementPrivateKey,
    },
    bundle,
    recipientUserId,
    oneTimePrekey,
  );

  return { envelope, plaintext };
}

// ── Decrypt ─────────────────────────────────────────────────────────────

/**
 * Decrypt a single message. If the message is not encrypted, returns the
 * body as-is. If encrypted, decrypts and returns the plaintext string.
 */
export type DecryptedMessageResult = {
  /** Decrypted text, or null when decryption failed (UI shows a resyncing skeleton). */
  body: string | null;
  encrypted?: boolean;
  id: string;
  /** True when decrypt failed because the ratchet session is missing or stale.
   *  The UI should request a re-key from the peer. */
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
  ownUserId: string,
): Promise<DecryptedMessageResult> {
  if (!message.encrypted || !message.envelope) {
    return { body: message.body ?? "", id: message.id };
  }

  try {
    const { decryptDmMessage } = await import("./envelope");
    const deviceId = getDeviceId(ownUserId);
    const identity = await getIdentityWithPrivateKeys(ownUserId, deviceId);

    const envelope = message.envelope as unknown as MessageEnvelopeV1;
    const senderUserId =
      message.senderId === ownUserId ? ownUserId : message.senderId;

    const { plaintext } = await decryptDmMessage(
      envelope,
      {
        signingPrivateKey: identity.signingPrivateKey,
        agreementPrivateKey: identity.agreementPrivateKey,
        signedPrekeyPrivateKey: identity.signedPrekeyPrivateKey,
        signedPrekeyPublicKey: identity.signedPrekeyPublicKey,
      },
      senderUserId,
      ownUserId,
    );

    const result: DecryptedMessageResult = {
      body: plaintext.text ?? "",
      id: message.id,
    };
    if (plaintext.attachment) {
      result.decryptedAttachment = plaintext.attachment;
    }

    // Persist the decrypted plaintext so it survives page reloads and
    // ratchet session loss (Signal/WhatsApp strategy).
    try {
      const peerUserId =
        message.senderId === ownUserId
          ? (message.recipientId ?? "")
          : message.senderId;
      await cacheDecryptedMessage(ownUserId, {
        messageId: message.id,
        peerUserId,
        body: result.body ?? "",
        senderId: message.senderId,
        recipientId: message.recipientId ?? ownUserId,
        createdAt: message.createdAt ?? new Date().toISOString(),
        ...(result.decryptedAttachment
          ? { decryptedAttachment: result.decryptedAttachment }
          : {}),
      });
    } catch {
      // Best-effort — caching failure must not break decryption.
    }

    return result;
  } catch (err) {
    console.warn("[E2EE] Failed to decrypt message, resyncing session:", err);
    const errMsg = err instanceof Error ? err.message : "";
    const needsRekey =
      errMsg.includes("No ratchet session") ||
      errMsg.includes("Receiving chain not established");
    // Delete the corrupted/stale ratchet session so the next message
    // triggers a fresh X3DH handshake instead of permanently failing.
    try {
      const { deleteRatchetSession } = await import("./store");
      const senderUserId =
        message.senderId === ownUserId ? ownUserId : message.senderId;
      await deleteRatchetSession(ownUserId, senderUserId);
    } catch {
      // Best-effort cleanup — if IndexedDB write fails, the next
      // successful decrypt will overwrite the session anyway.
    }
    return { body: null, id: message.id, needsRekey };
  }
}

/**
 * Decrypt a batch of messages (for history loads).
 * Returns a new array with `body` populated from decryption where needed.
 *
 * Strategy:
 *   1. Try ratchet decryption for each encrypted message.
 *   2. On success → cache plaintext, return it.
 *   3. On failure → fall back to cached plaintext (from a prior session).
 *   4. If no cache either → return null body + needsRekey flag.
 *
 * This means messages survive page reloads, browser restarts, and even
 * ratchet session loss — as long as they were decrypted at least once
 * before the session was lost.
 */
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
  ownUserId: string,
): Promise<Array<DecryptedMessageResult>> {
  // Only import decrypt if we actually have encrypted messages
  const hasEncrypted = messages.some((m) => m.encrypted && m.envelope);
  if (!hasEncrypted) {
    return messages.map((m) => ({ ...m, body: m.body ?? "" }));
  }

  // Pre-fetch the cache for the conversation partner so we can fall back
  // to it when ratchet decryption fails. We determine the peer from the
  // first encrypted message (all messages in a DM conversation share the
  // same peer).
  const peerUserId =
    messages.find((m) => m.encrypted)?.senderId === ownUserId
      ? (messages.find((m) => m.encrypted)?.recipientId ?? "")
      : (messages.find((m) => m.encrypted)?.senderId ?? "");
  let cacheMap = new Map<string, CachedDecryptedMessage>();
  try {
    cacheMap = await getCachedDecryptedMessagesMap(ownUserId, peerUserId);
  } catch {
    // Cache unavailable — proceed without fallback.
  }

  const { decryptDmMessage } = await import("./envelope");
  const deviceId = getDeviceId(ownUserId);
  const identity = await getIdentityWithPrivateKeys(ownUserId, deviceId);

  const results: Array<DecryptedMessageResult> = [];

  for (const msg of messages) {
    if (!msg.encrypted || !msg.envelope) {
      results.push({ ...msg, body: msg.body ?? "" });
      continue;
    }

    // ── Ratchet decryption attempt ──────────────────────────────────
    try {
      const envelope = msg.envelope as unknown as MessageEnvelopeV1;
      const senderUserId =
        msg.senderId === ownUserId ? ownUserId : msg.senderId;

      const { plaintext } = await decryptDmMessage(
        envelope,
        {
          signingPrivateKey: identity.signingPrivateKey,
          agreementPrivateKey: identity.agreementPrivateKey,
          signedPrekeyPrivateKey: identity.signedPrekeyPrivateKey,
          signedPrekeyPublicKey: identity.signedPrekeyPublicKey,
        },
        senderUserId,
        ownUserId,
      );

      const result: DecryptedMessageResult = {
        ...msg,
        body: plaintext.text ?? "",
      };
      if (plaintext.attachment) {
        result.decryptedAttachment = plaintext.attachment;
      }

      // Cache the successfully decrypted plaintext.
      try {
        const peer =
          msg.senderId === ownUserId ? (msg.recipientId ?? "") : msg.senderId;
        await cacheDecryptedMessage(ownUserId, {
          messageId: msg.id,
          peerUserId: peer,
          body: result.body ?? "",
          senderId: msg.senderId,
          recipientId: msg.recipientId ?? ownUserId,
          createdAt: msg.createdAt ?? new Date().toISOString(),
          ...(result.decryptedAttachment
            ? { decryptedAttachment: result.decryptedAttachment }
            : {}),
        });
      } catch {
        // Best-effort caching.
      }

      results.push(result);
    } catch (err) {
      // ── Ratchet failed — try cache fallback ─────────────────────
      const cached = cacheMap.get(msg.id);
      if (cached) {
        // Message was decrypted in a previous session — use cached plaintext.
        const result: DecryptedMessageResult = {
          ...msg,
          body: cached.body,
          id: msg.id,
        };
        if (cached.decryptedAttachment) {
          result.decryptedAttachment = cached.decryptedAttachment;
        }
        results.push(result);
        continue;
      }

      // ── No cache either — mark as needing re-key ────────────────
      console.warn(
        `[E2EE] Failed to decrypt message ${msg.id}, resyncing session:`,
        err,
      );
      const errMsg = err instanceof Error ? err.message : "";
      const needsRekey =
        errMsg.includes("No ratchet session") ||
        errMsg.includes("Receiving chain not established");
      // Delete the corrupted/stale ratchet session for this peer so
      // subsequent messages trigger a fresh X3DH handshake.
      try {
        const { deleteRatchetSession } = await import("./store");
        const senderUserId =
          msg.senderId === ownUserId ? ownUserId : msg.senderId;
        await deleteRatchetSession(ownUserId, senderUserId);
      } catch {
        // Best-effort cleanup.
      }
      results.push({ ...msg, body: null, needsRekey });
    }
  }

  return results;
}

/**
 * Decrypt a conversation preview (lastMessage).
 * If lastMessage is an envelope object, decrypts it.
 * If it's a plain string, returns it as-is.
 *
 * Uses cached plaintext as fallback when the ratchet session is missing.
 * This ensures the sidebar always shows readable text, not "🔒 Encrypted".
 */
export async function decryptConversationPreview(
  lastMessage: string | Record<string, unknown>,
  peerUserId: string,
  ownUserId: string,
): Promise<string> {
  if (typeof lastMessage === "string") return lastMessage;

  // Don't create a ratchet session here — that would consume message keys
  // that decryptMessages still needs. Only decrypt if a session already
  // exists (i.e. the user has already opened this conversation).
  try {
    const { getRatchetSession, getCachedDecryptedMessagesForPeer } =
      await import("./store");
    const existingSession = await getRatchetSession(ownUserId, peerUserId);

    // Try ratchet decryption if a session exists.
    if (existingSession) {
      try {
        const { decryptDmMessage } = await import("./envelope");
        const deviceId = getDeviceId(ownUserId);
        const identity = await getIdentityWithPrivateKeys(ownUserId, deviceId);

        const envelope = lastMessage as unknown as MessageEnvelopeV1;
        const senderUserId = peerUserId;

        const { plaintext } = await decryptDmMessage(
          envelope,
          {
            signingPrivateKey: identity.signingPrivateKey,
            agreementPrivateKey: identity.agreementPrivateKey,
            signedPrekeyPrivateKey: identity.signedPrekeyPrivateKey,
            signedPrekeyPublicKey: identity.signedPrekeyPublicKey,
          },
          senderUserId,
          ownUserId,
        );

        return plaintext.text ?? "";
      } catch (err) {
        // Ratchet decrypt failed — fall through to cache lookup.
        console.warn(
          "[E2EE] Ratchet decrypt of preview failed, trying cache:",
          err,
        );
      }
    }

    // Fallback: check the cache for the most recent decrypted message
    // from this peer. The envelope's messageId isn't available here (it's
    // just the raw envelope object), so we fetch the most recent cached
    // message and return its body. This is a best-effort approximation —
    // the sidebar preview may not match the absolute latest message if
    // that message hasn't been decrypted yet, but it's vastly better
    // than showing "🔒 Encrypted" permanently.
    try {
      const cachedMessages = await getCachedDecryptedMessagesForPeer(
        ownUserId,
        peerUserId,
      );
      if (cachedMessages.length > 0) {
        // Return the most recent cached message body.
        const latest = cachedMessages[cachedMessages.length - 1];
        return latest.body || "[Encrypted]";
      }
    } catch {
      // Cache unavailable.
    }

    return "[Encrypted]";
  } catch (err) {
    console.warn(
      "[E2EE] Failed to decrypt conversation preview, resyncing session:",
      err,
    );
    // Delete the corrupted session so next open triggers fresh handshake.
    try {
      const { deleteRatchetSession } = await import("./store");
      await deleteRatchetSession(ownUserId, peerUserId);
    } catch {
      // Best-effort cleanup.
    }
    return "[Encrypted]";
  }
}

// ── Internal helpers ────────────────────────────────────────────────────

/**
 * Stable per-(browser, account) device ID, persisted in localStorage under
 * a key scoped by `ownUserId` — a bare "e2ee:deviceId" key would be shared
 * by every account ever logged into this browser, exactly the storage
 * bug this scoping exists to avoid (see the store.ts module docstring).
 */
export function getDeviceId(ownUserId: string): string {
  if (typeof window === "undefined") return "server-side";
  const key = `e2ee:deviceId:${ownUserId}`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `device-${crypto.randomUUID()}`;
  localStorage.setItem(key, id);
  return id;
}

async function getIdentityWithPrivateKeys(
  ownUserId: string,
  deviceId: string,
): Promise<{
  identity: DeviceIdentity;
  signingPrivateKey: string;
  agreementPrivateKey: string;
  signedPrekeyPrivateKey: string;
  signedPrekeyPublicKey: string;
}> {
  const { ensureIdentity } = await import("./identity");
  const { getIdentitySigningPrivateKey, getIdentityAgreementPrivateKey } =
    await import("./identity");
  const { getSignedPrekey } = await import("./store");

  const { identity } = await ensureIdentity(ownUserId, deviceId);

  const signingPrivateKey = await getIdentitySigningPrivateKey(ownUserId);
  const agreementPrivateKey = await getIdentityAgreementPrivateKey(ownUserId);

  const spk = await getSignedPrekey(ownUserId, 0);
  const signedPrekeyPrivateKey = spk?.privateKey ?? "";
  const signedPrekeyPublicKey = spk?.publicKey ?? "";

  return {
    identity,
    signingPrivateKey,
    agreementPrivateKey,
    signedPrekeyPrivateKey,
    signedPrekeyPublicKey,
  };
}

// ── Conversation reset ─────────────────────────────────────────────────

/**
 * Reset all E2EE state for a specific conversation. Clears:
 *   - The ratchet session (so next message triggers fresh X3DH)
 *   - The decrypted message cache (so messages show as "Encrypted" until
 *     re-decrypted with the new session)
 *
 * Use this when a conversation is permanently stuck showing "Encrypted"
 * (e.g. after account-sharing key contamination). The next message sent
 * or received will re-establish encryption from scratch.
 */
export async function resetConversation(
  ownUserId: string,
  peerUserId: string,
): Promise<void> {
  const { deleteRatchetSession, clearCachedDecryptedMessages } =
    await import("./store");
  await Promise.all([
    deleteRatchetSession(ownUserId, peerUserId).catch(() => {}),
    clearCachedDecryptedMessages(ownUserId, peerUserId).catch(() => {}),
  ]);
}

/**
 * Attempt to re-decrypt all messages in a conversation using the current
 * session. Called after a fresh X3DH handshake is established to update
 * any messages that were previously shown as "Encrypted" or "Re-syncing".
 *
 * Returns the updated messages array — the caller should patch the query
 * cache with the result.
 */
export async function tryRedecryptConversation(
  messages: Array<{
    id: string;
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
    senderId: string;
    recipientId?: string;
    createdAt?: string;
  }>,
  ownUserId: string,
): Promise<Array<DecryptedMessageResult>> {
  // Only re-process messages that are still encrypted (body is null or empty)
  const needsRedecrypt = messages.filter(
    (m) => m.encrypted && (!m.body || m.body === ""),
  );
  if (needsRedecrypt.length === 0) {
    return messages.map((m) => ({ ...m, body: m.body ?? "" }));
  }

  // Use decryptMessages which already handles cache fallback
  return decryptMessages(messages, ownUserId);
}
