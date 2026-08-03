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
} from "./store";
import type {
  DeviceIdentity,
  DeviceBundle,
  SignedPrekey,
  OneTimePrekey,
} from "./types";

const ALG_VERSION = 1;
const PREKEY_BATCH_SIZE = 10;
const PREKEY_SERVER_BATCH = 10;

/**
 * Ensure a device identity exists.  Returns the identity and the server
 * registration payload (public keys only).
 *
 * If no identity exists in IndexedDB, generates one.  If an identity
 * already exists, returns it along with the current signed prekey.
 */
export async function ensureIdentity(deviceId: string): Promise<{
  identity: DeviceIdentity;
  bundle: DeviceBundle;
  serverPrekeys: Array<{ keyId: string; publicKey: string }>;
}> {
  let identity = await getIdentity();

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

    // Persist private key material (for signing + DH)
    await setIdentity({
      ...identity,
      // Store private keys alongside (non-enumerable in the public type)
    } as DeviceIdentity & Record<string, unknown>);

    // Store private keys separately in prekeys store for reference
    // (identity signing key private key is stored via the identity store)
    const db = await import("./store").then((m) => m.getIdentity());
    // We store the private keys as extra fields on the identity
    await persistIdentityPrivateKeys(ikSig.privateKey, ikDh.privateKey);
  }

  // Generate or retrieve signed prekey
  let spk = await getCurrentSignedPrekey();
  if (!spk) {
    const signingKeyHex = await getIdentitySigningPrivateKey();
    const raw = generateSignedPrekey(signingKeyHex);
    spk = {
      keyId: 0,
      publicKey: raw.publicKey,
      signature: raw.signature,
      createdAt: new Date().toISOString(),
      privateKey: raw.privateKey,
    };
    await setSignedPrekey(0, spk);
  }

  // Generate one-time prekeys for initial upload
  const serverPrekeys = generateOneTimePrekeys(PREKEY_SERVER_BATCH);
  for (const opk of serverPrekeys) {
    await setOneTimePrekey(opk.keyId, opk);
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
export async function getIdentitySigningPrivateKey(): Promise<string> {
  const db = await import("idb").then((m) =>
    m
      .openDB("e2ee", 1)
      .then((d) => d.get("prekeys", "identity-signing-privkey")),
  );
  return db as unknown as string;
}

/** Retrieve the identity agreement private key from IndexedDB. */
export async function getIdentityAgreementPrivateKey(): Promise<string> {
  const db = await import("idb").then((m) =>
    m
      .openDB("e2ee", 1)
      .then((d) => d.get("prekeys", "identity-agreement-privkey")),
  );
  return db as unknown as string;
}

async function persistIdentityPrivateKeys(
  signingPrivkey: string,
  agreementPrivkey: string,
): Promise<void> {
  const { openDB } = await import("idb");
  const db = await openDB("e2ee", 1);
  await db.put("prekeys", signingPrivkey, "identity-signing-privkey");
  await db.put("prekeys", agreementPrivkey, "identity-agreement-privkey");
}

async function getCurrentSignedPrekey(): Promise<
  (SignedPrekey & { privateKey: string }) | null
> {
  // Try keyId 0 (current), fall back to null
  return getSignedPrekey(0);
}

// ── Helper ──────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
