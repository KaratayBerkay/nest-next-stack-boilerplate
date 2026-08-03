/**
 * X3DH (Extended Triple Diffie-Hellman) first-contact handshake (§1.3).
 *
 * Initiator side: given a peer's public bundle, verify signatures, compute
 * the shared secret, and produce an X3DH preamble for the first message.
 *
 * Responder side: given the X3DH preamble from an incoming first message and
 * our own private keys, re-derive the shared secret and clean up the consumed
 * OPK.
 */

import {
  x25519SharedSecret,
  x3dhDeriveSessionKey,
  ed25519Verify,
} from "./primitives";
import type { DeviceBundle, X3dhInit } from "./types";

// ── Types ───────────────────────────────────────────────────────────────

export interface X3dhHandshakeResult {
  /** Shared session key (hex) — feed into the Double Ratchet as root key. */
  sessionKey: string;
  /** Preamble to include in the first message envelope. */
  init: X3dhInit;
}

export interface X3dhResponderInput {
  /** Bob's identity signing private key (hex). */
  identitySigningPrivateKey: string;
  /** Bob's identity agreement private key (hex). */
  identityAgreementPrivateKey: string;
  /** Bob's signed prekey private key (hex). */
  signedPrekeyPrivateKey: string;
  /** Bob's one-time prekey private key (hex), if one was consumed. */
  oneTimePrekeyPrivateKey?: string;
  /** The X3DH preamble from Alice's first message. */
  init: X3dhInit;
}

// ── Initiator (Alice) ───────────────────────────────────────────────────

/**
 * Perform the X3DH initiator handshake.
 *
 * Verifies the peer's bundle signatures, generates an ephemeral keypair,
 * computes the 4-DH shared secret, and returns the session key + preamble.
 *
 * @throws if bundle signatures are invalid
 */
export function x3dhInitiate(
  /** Alice's identity keypair (public key hex + private key hex). */
  aliceIdentity: { publicKey: string; privateKey: string },
  /** Bob's public bundle from the server. */
  bobBundle: DeviceBundle,
  /** Alice's ephemeral keypair (generate with generateEphemeralKey()). */
  ephemeral: { publicKey: string; privateKey: string },
  /** The OPK public key hex that was consumed, if any. */
  oneTimePrekeyPublicKey?: string,
): X3dhHandshakeResult {
  // 1. Verify SPK signature: sig(IK_sig_B, SPK_pub) must verify
  const spkValid = ed25519Verify(
    bobBundle.identitySigningKey,
    bobBundle.signedPrekeySignature,
    hexToBytes(bobBundle.signedPrekey),
  );
  if (!spkValid) {
    throw new Error("X3DH: signed prekey signature verification failed");
  }

  // 2. Verify IK agreement key signature: sig(IK_sig_B, IK_dh_pub)
  const ikValid = ed25519Verify(
    bobBundle.identitySigningKey,
    bobBundle.identityAgreementKeySignature,
    hexToBytes(bobBundle.identityAgreementKey),
  );
  if (!ikValid) {
    throw new Error(
      "X3DH: identity agreement key signature verification failed",
    );
  }

  // 3. Compute the four DH outputs
  const dh1 = x25519SharedSecret(
    aliceIdentity.privateKey,
    bobBundle.signedPrekey,
  );
  const dh2 = x25519SharedSecret(
    ephemeral.privateKey,
    bobBundle.identityAgreementKey,
  );
  const dh3 = x25519SharedSecret(ephemeral.privateKey, bobBundle.signedPrekey);

  let dh4: string | undefined;
  if (oneTimePrekeyPublicKey && ephemeral.privateKey) {
    dh4 = x25519SharedSecret(ephemeral.privateKey, oneTimePrekeyPublicKey);
  }

  // 4. Derive session key
  const sessionKey = x3dhDeriveSessionKey(dh1, dh2, dh3, dh4);

  // 5. Build the X3DH preamble
  const init: X3dhInit = {
    identityKey: aliceIdentity.publicKey,
    ephemeralKey: ephemeral.publicKey,
    usedSignedPrekeyId: bobBundle.signedPrekeyId,
    usedOneTimePrekeyId: oneTimePrekeyPublicKey
      ? `otpk-${Date.now()}-0` // placeholder — resolved by OPK tracking
      : undefined,
  };

  return { sessionKey, init };
}

// ── Responder (Bob) ─────────────────────────────────────────────────────

/**
 * Perform the X3DH responder handshake.
 *
 * Given Alice's X3DH preamble and Bob's private keys, re-derives the shared
 * session key. Bob should then delete the consumed OPK from IndexedDB.
 */
export function x3dhRespond(input: X3dhResponderInput): string {
  const {
    identityAgreementPrivateKey,
    signedPrekeyPrivateKey,
    oneTimePrekeyPrivateKey,
    init,
  } = input;

  // Mirror Alice's DH computation (roles reversed):
  // Alice computed:
  //   DH1 = DH(IKa_priv, SPKb_pub)
  //   DH2 = DH(EKa_priv, IKb_pub)
  //   DH3 = DH(EKa_priv, SPKb_pub)
  //   DH4 = DH(EKa_priv, OPKb_pub)
  //
  // Bob mirrors with his private keys:
  //   DH1 = DH(SPKb_priv, IKa_pub)  — same as DH(IKa_priv, SPKb_pub)
  //   DH2 = DH(IKb_priv,  EKa_pub)  — same as DH(EKa_priv, IKb_pub)
  //   DH3 = DH(SPKb_priv, EKa_pub)  — same as DH(EKa_priv, SPKb_pub)
  //   DH4 = DH(OPKb_priv, EKa_pub)  — same as DH(EKa_priv, OPKb_pub)

  const dh1 = x25519SharedSecret(signedPrekeyPrivateKey, init.identityKey);
  const dh2 = x25519SharedSecret(
    identityAgreementPrivateKey,
    init.ephemeralKey,
  );
  const dh3 = x25519SharedSecret(signedPrekeyPrivateKey, init.ephemeralKey);

  let dh4: string | undefined;
  if (oneTimePrekeyPrivateKey) {
    dh4 = x25519SharedSecret(oneTimePrekeyPrivateKey, init.ephemeralKey);
  }

  return x3dhDeriveSessionKey(dh1, dh2, dh3, dh4);
}

// ── Helpers ─────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
