/**
 * Device identity management (§1.2 of the plan).
 *
 * Lazy generation: called on first mount of the Messages page via
 * useE2eeIdentity().  The identity is persisted in IndexedDB and
 * reused across sessions on the same browser/device.
 */

import {
  generateIdentitySigningKey,
  generateIdentityAgreementKey,
  ed25519Sign,
  generateSignedPrekey,
  generateOneTimePrekeys,
} from "./primitives";
import {
  getIdentity,
  setIdentity,
  getSignedPrekey,
  setSignedPrekey,
  setOneTimePrekey,
  getAllOneTimePrekeys,
  deleteOneTimePrekey,
  getIdentitySigningPrivateKey as storeGetIdentitySigningPrivateKey,
  setIdentitySigningPrivateKey,
  getIdentityAgreementPrivateKey as storeGetIdentityAgreementPrivateKey,
  setIdentityAgreementPrivateKey,
} from "./store";
import type { DeviceIdentity, DeviceBundle, SignedPrekey } from "./types";

const ALG_VERSION = 1;
const PREKEY_SERVER_BATCH = 10;
/** Keep at most this many OTPKs in IndexedDB to prevent unbounded growth. */
const MAX_OTPK_COUNT = 20;
/** Replenish when OTPK count drops below this threshold. */
const MIN_OTPK_COUNT = 5;

/**
 * Ensure a device identity exists.  Returns the identity and the server
 * registration payload (public keys only).
 *
 * If no identity exists in IndexedDB, generates one.  If an identity
 * already exists, returns it along with the current signed prekey.
 */
export async function ensureIdentity(
  ownUserId: string,
  deviceId: string,
): Promise<{
  identity: DeviceIdentity;
  bundle: DeviceBundle;
  serverPrekeys: Array<{ keyId: string; publicKey: string }>;
}> {
  let identity = await getIdentity(ownUserId);

  if (!identity) {
    // Generate fresh identity keypairs
    const ikSig = generateIdentitySigningKey();
    const ikDh = generateIdentityAgreementKey();
    const ikDhSig = ed25519Sign(ikSig.privateKey, hexToBytes(ikDh.publicKey));

    identity = {
      v: 1,
      deviceId,
      identitySigningKey: ikSig.publicKey,
      identityAgreementKey: ikDh.publicKey,
      identityAgreementKeySignature: ikDhSig,
      createdAt: new Date().toISOString(),
    };

    await setIdentity(ownUserId, identity);
    await persistIdentityPrivateKeys(
      ownUserId,
      ikSig.privateKey,
      ikDh.privateKey,
    );
  }

  // Generate or retrieve signed prekey
  let spk = await getCurrentSignedPrekey(ownUserId);
  if (!spk) {
    const signingKeyHex = await getIdentitySigningPrivateKey(ownUserId);
    const raw = generateSignedPrekey(signingKeyHex);
    spk = {
      keyId: 0,
      publicKey: raw.publicKey,
      signature: raw.signature,
      createdAt: new Date().toISOString(),
      privateKey: raw.privateKey,
    };
    await setSignedPrekey(ownUserId, 0, spk);
  }

  // Only generate one-time prekeys if we're running low
  const existingOpks = await getAllOneTimePrekeys(ownUserId);
  let serverPrekeys: Array<{ keyId: string; publicKey: string }> = [];

  if (existingOpks.length < MIN_OTPK_COUNT) {
    const newOpks = generateOneTimePrekeys(PREKEY_SERVER_BATCH);
    for (const opk of newOpks) {
      await setOneTimePrekey(ownUserId, opk.keyId, opk);
    }
    serverPrekeys = newOpks.map(({ keyId, publicKey }) => ({
      keyId,
      publicKey,
    }));

    // Clean up excess OTPKs — keep only the newest MAX_OTPK_COUNT
    const allOpks = await getAllOneTimePrekeys(ownUserId);
    if (allOpks.length > MAX_OTPK_COUNT) {
      const sorted = allOpks.sort((a, b) => a.keyId.localeCompare(b.keyId));
      const toDelete = sorted.slice(0, allOpks.length - MAX_OTPK_COUNT);
      for (const opk of toDelete) {
        await deleteOneTimePrekey(ownUserId, opk.keyId);
      }
    }
  }

  // Build the public bundle for server registration
  const bundle: DeviceBundle = {
    identitySigningKey: identity.identitySigningKey,
    identityAgreementKey: identity.identityAgreementKey,
    identityAgreementKeySignature: identity.identityAgreementKeySignature,
    signedPrekey: spk.publicKey,
    signedPrekeySignature: spk.signature,
    signedPrekeyId: 0,
    algVersion: ALG_VERSION,
  };

  return {
    identity,
    bundle,
    serverPrekeys: serverPrekeys.map(({ keyId, publicKey }) => ({
      keyId,
      publicKey,
    })),
  };
}

// ── Private key access (for signing operations) ─────────────────────────

/** Retrieve the identity signing private key from IndexedDB. */
export async function getIdentitySigningPrivateKey(
  ownUserId: string,
): Promise<string> {
  return (await storeGetIdentitySigningPrivateKey(ownUserId)) as string;
}

/** Retrieve the identity agreement private key from IndexedDB. */
export async function getIdentityAgreementPrivateKey(
  ownUserId: string,
): Promise<string> {
  return (await storeGetIdentityAgreementPrivateKey(ownUserId)) as string;
}

async function persistIdentityPrivateKeys(
  ownUserId: string,
  signingPrivkey: string,
  agreementPrivkey: string,
): Promise<void> {
  await setIdentitySigningPrivateKey(ownUserId, signingPrivkey);
  await setIdentityAgreementPrivateKey(ownUserId, agreementPrivkey);
}

async function getCurrentSignedPrekey(
  ownUserId: string,
): Promise<(SignedPrekey & { privateKey: string }) | null> {
  // Try keyId 0 (current), fall back to null
  return getSignedPrekey(ownUserId, 0);
}

// ── Helper ──────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
