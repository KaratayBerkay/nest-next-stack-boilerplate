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

// ── Feature flag ────────────────────────────────────────────────────────

export function isE2eeDmEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return process.env.NEXT_PUBLIC_E2EE_DM_ENABLED === "true";
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
  text: string,
  recipientUserId: string,
  attachmentMetadata?: AttachmentCryptoMetadata,
): Promise<{ envelope: MessageEnvelopeV1; plaintext: MessagePlaintextV1 }> {
  const { ensureIdentity } = await import("./identity");
  const { encryptDmMessage } = await import("./envelope");

  // Get or generate our device identity
  const deviceId = getDeviceId();
  const { identity, signingPrivateKey, agreementPrivateKey } =
    await getIdentityWithPrivateKeys(deviceId);

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
    plaintext,
    {
      identity,
      signingPrivateKey,
      agreementPrivateKey,
    },
    bundle,
    recipientUserId,
    oneTimePrekey?.publicKey,
  );

  return { envelope, plaintext };
}

// ── Decrypt ─────────────────────────────────────────────────────────────

/**
 * Decrypt a single message. If the message is not encrypted, returns the
 * body as-is. If encrypted, decrypts and returns the plaintext string.
 */
export type DecryptedMessageResult = {
  body: string;
  encrypted?: boolean;
  id: string;
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
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
    senderId: string;
  },
  ownUserId: string,
): Promise<DecryptedMessageResult> {
  if (!message.encrypted || !message.envelope) {
    return { body: message.body ?? "", id: "" };
  }

  try {
    const { decryptDmMessage } = await import("./envelope");
    const deviceId = getDeviceId();
    const identity = await getIdentityWithPrivateKeys(deviceId);

    const envelope = message.envelope as unknown as MessageEnvelopeV1;
    const senderUserId =
      message.senderId === ownUserId ? ownUserId : message.senderId;

    const { plaintext } = await decryptDmMessage(
      envelope,
      {
        signingPrivateKey: identity.signingPrivateKey,
        agreementPrivateKey: identity.agreementPrivateKey,
        signedPrekeyPrivateKey: identity.signedPrekeyPrivateKey,
        oneTimePrekeyPrivateKey: identity.oneTimePrekeyPrivateKey,
      },
      senderUserId,
    );

    const result: DecryptedMessageResult = {
      body: plaintext.text ?? "",
      id: "",
    };
    if (plaintext.attachment) {
      result.decryptedAttachment = plaintext.attachment;
    }
    return result;
  } catch (err) {
    console.warn("[E2EE] Failed to decrypt message:", err);
    return { body: "[Decryption failed]", id: "" };
  }
}

/**
 * Decrypt a batch of messages (for history loads).
 * Returns a new array with `body` populated from decryption where needed.
 */
export async function decryptMessages(
  messages: Array<{
    body?: string | null;
    encrypted?: boolean;
    envelope?: Record<string, unknown> | null;
    senderId: string;
    id: string;
  }>,
  ownUserId: string,
): Promise<Array<DecryptedMessageResult>> {
  // Only import decrypt if we actually have encrypted messages
  const hasEncrypted = messages.some((m) => m.encrypted && m.envelope);
  if (!hasEncrypted) {
    return messages.map((m) => ({ ...m, body: m.body ?? "" }));
  }

  const { decryptDmMessage } = await import("./envelope");
  const deviceId = getDeviceId();
  const identity = await getIdentityWithPrivateKeys(deviceId);

  const results: Array<DecryptedMessageResult> = [];

  for (const msg of messages) {
    if (!msg.encrypted || !msg.envelope) {
      results.push({ ...msg, body: msg.body ?? "" });
      continue;
    }

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
          oneTimePrekeyPrivateKey: identity.oneTimePrekeyPrivateKey,
        },
        senderUserId,
      );

      const result: DecryptedMessageResult = {
        ...msg,
        body: plaintext.text ?? "",
      };
      if (plaintext.attachment) {
        result.decryptedAttachment = plaintext.attachment;
      }
      results.push(result);
    } catch (err) {
      console.warn(`[E2EE] Failed to decrypt message ${msg.id}:`, err);
      results.push({ ...msg, body: "[Decryption failed]" });
    }
  }

  return results;
}

/**
 * Decrypt a conversation preview (lastMessage).
 * If lastMessage is an envelope object, decrypts it.
 * If it's a plain string, returns it as-is.
 */
export async function decryptConversationPreview(
  lastMessage: string | Record<string, unknown>,
  peerUserId: string,
  ownUserId: string,
): Promise<string> {
  if (typeof lastMessage === "string") return lastMessage;

  // It's an envelope object — decrypt it
  try {
    const { decryptDmMessage } = await import("./envelope");
    const deviceId = getDeviceId();
    const identity = await getIdentityWithPrivateKeys(deviceId);

    const envelope = lastMessage as unknown as MessageEnvelopeV1;
    const senderUserId = peerUserId;

    const { plaintext } = await decryptDmMessage(
      envelope,
      {
        signingPrivateKey: identity.signingPrivateKey,
        agreementPrivateKey: identity.agreementPrivateKey,
        signedPrekeyPrivateKey: identity.signedPrekeyPrivateKey,
        oneTimePrekeyPrivateKey: identity.oneTimePrekeyPrivateKey,
      },
      senderUserId,
    );

    return plaintext.text ?? "";
  } catch (err) {
    console.warn("[E2EE] Failed to decrypt conversation preview:", err);
    return "[Decryption failed]";
  }
}

// ── Internal helpers ────────────────────────────────────────────────────

const DEVICE_ID_KEY = "e2ee:deviceId";

function getDeviceId(): string {
  if (typeof window === "undefined") return "server-side";
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = `device-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

async function getIdentityWithPrivateKeys(deviceId: string): Promise<{
  identity: DeviceIdentity;
  signingPrivateKey: string;
  agreementPrivateKey: string;
  signedPrekeyPrivateKey: string;
  oneTimePrekeyPrivateKey?: string;
}> {
  const { ensureIdentity } = await import("./identity");
  const { getIdentitySigningPrivateKey, getIdentityAgreementPrivateKey } =
    await import("./identity");
  const { getSignedPrekey } = await import("./store");

  const { identity } = await ensureIdentity(deviceId);

  const signingPrivateKey = await getIdentitySigningPrivateKey();
  const agreementPrivateKey = await getIdentityAgreementPrivateKey();

  const spk = await getSignedPrekey(0);
  const signedPrekeyPrivateKey = spk?.privateKey ?? "";

  return {
    identity,
    signingPrivateKey,
    agreementPrivateKey,
    signedPrekeyPrivateKey,
  };
}
