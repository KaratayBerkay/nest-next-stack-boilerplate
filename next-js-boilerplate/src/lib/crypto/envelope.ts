/**
 * Message envelope encrypt/decrypt (§1.7).
 *
 * High-level API that ties X3DH (first message) and the Double Ratchet
 * (ongoing) into a single encrypt/decrypt call.  Produces/consumes the
 * MessageEnvelopeV1 wire format stored in Message.envelope.
 */

import {
  generateEphemeralKey,
  generateIdentitySigningKey,
  generateIdentityAgreementKey,
  generateSignedPrekey,
  generateOneTimePrekeys,
} from "./primitives";
import { x3dhInitiate, x3dhRespond, type X3dhResponderInput } from "./x3dh";
import {
  initSenderSession,
  initReceiverSession,
  ratchetEncrypt,
  ratchetDecrypt,
} from "./ratchet";
import type {
  DeviceBundle,
  DeviceIdentity,
  MessageEnvelopeV1,
  MessagePlaintextV1,
  X3dhInit,
  RatchetHeader,
} from "./types";
import { toBase64, fromBase64 } from "./primitives";

// ── Types ───────────────────────────────────────────────────────────────

export interface EncryptResult {
  envelope: MessageEnvelopeV1;
  plaintext: MessagePlaintextV1;
}

export interface DecryptResult {
  plaintext: MessagePlaintextV1;
  /** True if this was the first message (X3DH handshake). */
  wasHandshake: boolean;
}

// ── Encrypt ─────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext message for a DM recipient.
 *
 * On first message (no existing ratchet session), performs X3DH and
 * attaches the init preamble.  On subsequent messages, uses the ratchet.
 */
export async function encryptDmMessage(
  plaintext: MessagePlaintextV1,
  senderIdentity: {
    identity: DeviceIdentity;
    signingPrivateKey: string;
    agreementPrivateKey: string;
  },
  recipientBundle: DeviceBundle,
  recipientUserId: string,
  recipientOneTimePrekey?: { keyId: string; publicKey: string },
): Promise<EncryptResult> {
  const plaintextBytes = new TextEncoder().encode(JSON.stringify(plaintext));

  // Check if we already have a ratchet session for this peer
  const { getRatchetSession } = await import("./store");
  const existingSession = await getRatchetSession(recipientUserId);

  let init: X3dhInit | undefined;
  const isFirstMessage = !existingSession;

  if (isFirstMessage) {
    // Perform X3DH handshake
    const ephemeral = generateEphemeralKey();
    const { sessionKey, init: x3dhInit } = x3dhInitiate(
      {
        publicKey: senderIdentity.identity.identityAgreementKey,
        privateKey: senderIdentity.agreementPrivateKey,
      },
      recipientBundle,
      ephemeral,
      recipientOneTimePrekey,
    );

    // Initialize sender ratchet session — the sending chain is seeded via
    // a real DH against the peer's signed prekey (see ratchet.ts), which
    // the responder mirrors in initReceiverSession.
    await initSenderSession(
      recipientUserId,
      recipientBundle.identitySigningKey, // placeholder — real device ID comes from server
      sessionKey,
      recipientBundle.signedPrekey,
    );

    init = x3dhInit;
  }

  // Encrypt with ratchet
  const { ciphertext, nonce, header } = await ratchetEncrypt(
    recipientUserId,
    plaintextBytes,
    senderIdentity.identity.deviceId,
    recipientUserId,
  );

  const envelope: MessageEnvelopeV1 = {
    v: 1,
    senderDeviceId: senderIdentity.identity.deviceId,
    ciphertext,
    nonce,
    header,
    x3dhInit: init,
  };

  return { envelope, plaintext };
}

// ── Decrypt ─────────────────────────────────────────────────────────────

/**
 * Decrypt a DM message envelope.
 *
 * If the envelope contains an X3DH init preamble, performs the responder
 * handshake first, then decrypts with the ratchet.
 */
export async function decryptDmMessage(
  envelope: MessageEnvelopeV1,
  recipientIdentity: {
    signingPrivateKey: string;
    agreementPrivateKey: string;
    signedPrekeyPrivateKey: string;
    signedPrekeyPublicKey: string;
  },
  senderUserId: string,
  /** The current user's own id — i.e. the actual recipient of this
   * message. Must match the recipientUserId encryptDmMessage used to
   * build its AAD, or every decrypt fails with an auth-tag mismatch. */
  recipientUserId: string,
): Promise<DecryptResult> {
  // envelope.x3dhInit is a permanent property of a conversation's first
  // stored message — re-fetching/re-rendering history (pagination, a cache
  // refetch, a page reload) will see it again indefinitely. Only treat it
  // as an actual handshake to (re-)bootstrap if we don't already have a
  // session: otherwise this would silently roll back and corrupt a live,
  // already-advanced ratchet session every time that old message is viewed
  // again, breaking every message after it too.
  const { getRatchetSession } = await import("./store");
  const existingSession = await getRatchetSession(senderUserId);
  const wasHandshake = !!envelope.x3dhInit && !existingSession;

  if (wasHandshake) {
    // First message — look up the actual claimed one-time-prekey's private
    // half (by its real id, carried in the preamble) before responding.
    const usedOneTimePrekeyId = envelope.x3dhInit!.usedOneTimePrekeyId;
    let oneTimePrekeyPrivateKey: string | undefined;
    if (usedOneTimePrekeyId) {
      const { getOneTimePrekey } = await import("./store");
      const stored = await getOneTimePrekey(usedOneTimePrekeyId);
      oneTimePrekeyPrivateKey = stored?.privateKey;
    }

    // Perform X3DH responder handshake
    const responderInput: X3dhResponderInput = {
      identitySigningPrivateKey: recipientIdentity.signingPrivateKey,
      identityAgreementPrivateKey: recipientIdentity.agreementPrivateKey,
      signedPrekeyPrivateKey: recipientIdentity.signedPrekeyPrivateKey,
      oneTimePrekeyPrivateKey,
      init: envelope.x3dhInit!,
    };

    const sessionKey = x3dhRespond(responderInput);

    // Initialize receiver ratchet session using the sender's actual ratchet
    // key from the message header (NOT the X3DH ephemeral key — those are
    // two different keys; the header's dhPub is what every subsequent
    // message will be ratcheted against).
    await initReceiverSession(
      senderUserId,
      envelope.senderDeviceId,
      sessionKey,
      envelope.header.dhPub,
      recipientIdentity.signedPrekeyPrivateKey,
      recipientIdentity.signedPrekeyPublicKey,
    );

    // Delete consumed OPK from IndexedDB
    if (usedOneTimePrekeyId && oneTimePrekeyPrivateKey) {
      const { deleteOneTimePrekey } = await import("./store");
      await deleteOneTimePrekey(usedOneTimePrekeyId);
    }
  }

  // Decrypt with ratchet
  const plaintextBytes = await ratchetDecrypt(
    senderUserId,
    envelope.ciphertext,
    envelope.nonce,
    envelope.header,
    envelope.senderDeviceId,
    recipientUserId,
  );

  const plaintext: MessagePlaintextV1 = JSON.parse(
    new TextDecoder().decode(plaintextBytes),
  );

  return { plaintext, wasHandshake };
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function encodeEnvelope(envelope: MessageEnvelopeV1): string {
  return JSON.stringify(envelope);
}

export function decodeEnvelope(raw: string | object): MessageEnvelopeV1 {
  if (typeof raw === "string") {
    return JSON.parse(raw) as MessageEnvelopeV1;
  }
  return raw as MessageEnvelopeV1;
}
