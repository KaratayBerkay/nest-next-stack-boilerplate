/**
 * IndexedDB storage for E2EE key material (§4 of the plan).
 *
 * Uses the `idb` library for ergonomic async access.  All private key
 * material lives here — only public halves + signatures are ever POSTed
 * to the server.
 *
 * Origin-scoped (not additionally encrypted at rest) — the same trust
 * model every browser-based E2EE product accepts (WhatsApp Web, Signal
 * Desktop).  Device loss = key loss (§6).
 *
 * One physical database PER LOGGED-IN USER ID (`e2ee:${ownUserId}`), not
 * one shared database per browser. A browser that's ever been used to log
 * into more than one account (a developer testing with a second account,
 * a shared/kiosk machine) would otherwise silently reuse account A's
 * identity and ratchet sessions for account B — every function here takes
 * `ownUserId` as its first argument specifically to prevent that.
 */

import { openDB, type IDBPDatabase } from "idb";
import type {
  DeviceIdentity,
  OneTimePrekey,
  RatchetSession,
  SenderKeyChain,
  SignedPrekey,
} from "./types";

const DB_VERSION = 2;

// ── Store names ─────────────────────────────────────────────────────────

const IDENTITY_STORE = "identity";
const PREKEYS_STORE = "prekeys";
const RATCHET_STORE = "ratchet";
const SENDER_KEY_STORE = "senderKeys";
const SAFETY_NUMBERS_STORE = "safetyNumbers";

// ── Database singleton (one per user) ───────────────────────────────────

const dbPromises = new Map<string, Promise<IDBPDatabase>>();

function getDb(ownUserId: string): Promise<IDBPDatabase> {
  let dbPromise = dbPromises.get(ownUserId);
  if (!dbPromise) {
    dbPromise = openDB(`e2ee:${ownUserId}`, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(IDENTITY_STORE)) {
          db.createObjectStore(IDENTITY_STORE);
        }
        if (!db.objectStoreNames.contains(PREKEYS_STORE)) {
          db.createObjectStore(PREKEYS_STORE);
        }
        if (!db.objectStoreNames.contains(RATCHET_STORE)) {
          db.createObjectStore(RATCHET_STORE);
        }
        if (!db.objectStoreNames.contains(SENDER_KEY_STORE)) {
          db.createObjectStore(SENDER_KEY_STORE);
        }
        if (!db.objectStoreNames.contains(SAFETY_NUMBERS_STORE)) {
          db.createObjectStore(SAFETY_NUMBERS_STORE);
        }
      },
    });
    dbPromises.set(ownUserId, dbPromise);
  }
  return dbPromise;
}

// ── Identity ────────────────────────────────────────────────────────────

export async function getIdentity(
  ownUserId: string,
): Promise<DeviceIdentity | null> {
  const db = await getDb(ownUserId);
  return (await db.get(IDENTITY_STORE, "current")) ?? null;
}

export async function setIdentity(
  ownUserId: string,
  identity: DeviceIdentity,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(IDENTITY_STORE, identity, "current");
}

export async function deleteIdentity(ownUserId: string): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(IDENTITY_STORE, "current");
}

// ── Identity private keys (signing + agreement) ─────────────────────────
//
// Kept separate from the public `DeviceIdentity` record so callers that
// only need the private key material don't have to shuttle the whole
// identity around. Always routed through `getDb()` — never open this
// database directly (see the DB_VERSION comment above).

export async function getIdentitySigningPrivateKey(
  ownUserId: string,
): Promise<string | null> {
  const db = await getDb(ownUserId);
  return (await db.get(PREKEYS_STORE, "identity-signing-privkey")) ?? null;
}

export async function setIdentitySigningPrivateKey(
  ownUserId: string,
  privateKey: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(PREKEYS_STORE, privateKey, "identity-signing-privkey");
}

export async function getIdentityAgreementPrivateKey(
  ownUserId: string,
): Promise<string | null> {
  const db = await getDb(ownUserId);
  return (await db.get(PREKEYS_STORE, "identity-agreement-privkey")) ?? null;
}

export async function setIdentityAgreementPrivateKey(
  ownUserId: string,
  privateKey: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(PREKEYS_STORE, privateKey, "identity-agreement-privkey");
}

// ── Signed prekey private keys ──────────────────────────────────────────

export async function getSignedPrekey(
  ownUserId: string,
  keyId: number,
): Promise<(SignedPrekey & { privateKey: string }) | null> {
  const db = await getDb(ownUserId);
  return (await db.get(PREKEYS_STORE, `spk-${keyId}`)) ?? null;
}

export async function setSignedPrekey(
  ownUserId: string,
  keyId: number,
  spk: SignedPrekey & { privateKey: string },
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(PREKEYS_STORE, spk, `spk-${keyId}`);
}

export async function deleteSignedPrekey(
  ownUserId: string,
  keyId: number,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(PREKEYS_STORE, `spk-${keyId}`);
}

// ── One-time prekey private keys ────────────────────────────────────────

export async function getOneTimePrekey(
  ownUserId: string,
  keyId: string,
): Promise<(OneTimePrekey & { privateKey: string }) | null> {
  const db = await getDb(ownUserId);
  return (await db.get(PREKEYS_STORE, `otpk-${keyId}`)) ?? null;
}

export async function setOneTimePrekey(
  ownUserId: string,
  keyId: string,
  opk: OneTimePrekey & { privateKey: string },
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(PREKEYS_STORE, opk, `otpk-${keyId}`);
}

export async function deleteOneTimePrekey(
  ownUserId: string,
  keyId: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(PREKEYS_STORE, `otpk-${keyId}`);
}

export async function getAllOneTimePrekeys(
  ownUserId: string,
): Promise<Array<OneTimePrekey & { privateKey: string }>> {
  const db = await getDb(ownUserId);
  const allKeys = await db.getAllKeys(PREKEYS_STORE);
  const otpkKeys = allKeys.filter(
    (k): k is string => typeof k === "string" && k.startsWith("otpk-"),
  );
  const results: Array<OneTimePrekey & { privateKey: string }> = [];
  for (const key of otpkKeys) {
    const val = await db.get(PREKEYS_STORE, key);
    if (val) results.push(val);
  }
  return results;
}

// ── Ratchet session state ───────────────────────────────────────────────

export async function getRatchetSession(
  ownUserId: string,
  peerUserId: string,
): Promise<RatchetSession | null> {
  const db = await getDb(ownUserId);
  return (await db.get(RATCHET_STORE, peerUserId)) ?? null;
}

export async function setRatchetSession(
  ownUserId: string,
  session: RatchetSession,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(RATCHET_STORE, session, session.peerUserId);
}

export async function deleteRatchetSession(
  ownUserId: string,
  peerUserId: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(RATCHET_STORE, peerUserId);
}

// ── Sender key chains (rooms, §1.5) ─────────────────────────────────────

export async function getSenderKeyChain(
  ownUserId: string,
  roomId: string,
): Promise<SenderKeyChain | null> {
  const db = await getDb(ownUserId);
  return (await db.get(SENDER_KEY_STORE, roomId)) ?? null;
}

export async function setSenderKeyChain(
  ownUserId: string,
  chain: SenderKeyChain,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(SENDER_KEY_STORE, chain, chain.roomId);
}

export async function deleteSenderKeyChain(
  ownUserId: string,
  roomId: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(SENDER_KEY_STORE, roomId);
}

// ── Safety numbers (§1.6) ───────────────────────────────────────────────

export async function getSafetyNumber(
  ownUserId: string,
  peerUserId: string,
): Promise<string | null> {
  const db = await getDb(ownUserId);
  return (await db.get(SAFETY_NUMBERS_STORE, peerUserId)) ?? null;
}

export async function setSafetyNumber(
  ownUserId: string,
  peerUserId: string,
  fingerprint: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(SAFETY_NUMBERS_STORE, fingerprint, peerUserId);
}

export async function deleteSafetyNumber(
  ownUserId: string,
  peerUserId: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.delete(SAFETY_NUMBERS_STORE, peerUserId);
}
