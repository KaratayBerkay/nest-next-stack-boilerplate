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
 */

import { openDB, type IDBPDatabase } from "idb";
import type {
  DeviceIdentity,
  OneTimePrekey,
  RatchetSession,
  SenderKeyChain,
  SignedPrekey,
} from "./types";

const DB_NAME = "e2ee";
const DB_VERSION = 1;

// ── Store names ─────────────────────────────────────────────────────────

const IDENTITY_STORE = "identity";
const PREKEYS_STORE = "prekeys";
const RATCHET_STORE = "ratchet";
const SENDER_KEY_STORE = "senderKeys";
const SAFETY_NUMBERS_STORE = "safetyNumbers";

// ── Database singleton ──────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
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
  }
  return dbPromise;
}

// ── Identity ────────────────────────────────────────────────────────────

export async function getIdentity(): Promise<DeviceIdentity | null> {
  const db = await getDb();
  return (await db.get(IDENTITY_STORE, "current")) ?? null;
}

export async function setIdentity(identity: DeviceIdentity): Promise<void> {
  const db = await getDb();
  await db.put(IDENTITY_STORE, identity, "current");
}

export async function deleteIdentity(): Promise<void> {
  const db = await getDb();
  await db.delete(IDENTITY_STORE, "current");
}

// ── Signed prekey private keys ──────────────────────────────────────────

export async function getSignedPrekey(
  keyId: number,
): Promise<(SignedPrekey & { privateKey: string }) | null> {
  const db = await getDb();
  return (await db.get(PREKEYS_STORE, `spk-${keyId}`)) ?? null;
}

export async function setSignedPrekey(
  keyId: number,
  spk: SignedPrekey & { privateKey: string },
): Promise<void> {
  const db = await getDb();
  await db.put(PREKEYS_STORE, spk, `spk-${keyId}`);
}

export async function deleteSignedPrekey(keyId: number): Promise<void> {
  const db = await getDb();
  await db.delete(PREKEYS_STORE, `spk-${keyId}`);
}

// ── One-time prekey private keys ────────────────────────────────────────

export async function getOneTimePrekey(
  keyId: string,
): Promise<(OneTimePrekey & { privateKey: string }) | null> {
  const db = await getDb();
  return (await db.get(PREKEYS_STORE, `otpk-${keyId}`)) ?? null;
}

export async function setOneTimePrekey(
  keyId: string,
  opk: OneTimePrekey & { privateKey: string },
): Promise<void> {
  const db = await getDb();
  await db.put(PREKEYS_STORE, opk, `otpk-${keyId}`);
}

export async function deleteOneTimePrekey(keyId: string): Promise<void> {
  const db = await getDb();
  await db.delete(PREKEYS_STORE, `otpk-${keyId}`);
}

// ── Ratchet session state ───────────────────────────────────────────────

export async function getRatchetSession(
  peerUserId: string,
): Promise<RatchetSession | null> {
  const db = await getDb();
  return (await db.get(RATCHET_STORE, peerUserId)) ?? null;
}

export async function setRatchetSession(
  session: RatchetSession,
): Promise<void> {
  const db = await getDb();
  await db.put(RATCHET_STORE, session, session.peerUserId);
}

export async function deleteRatchetSession(peerUserId: string): Promise<void> {
  const db = await getDb();
  await db.delete(RATCHET_STORE, peerUserId);
}

// ── Sender key chains (rooms, §1.5) ─────────────────────────────────────

export async function getSenderKeyChain(
  roomId: string,
): Promise<SenderKeyChain | null> {
  const db = await getDb();
  return (await db.get(SENDER_KEY_STORE, roomId)) ?? null;
}

export async function setSenderKeyChain(chain: SenderKeyChain): Promise<void> {
  const db = await getDb();
  await db.put(SENDER_KEY_STORE, chain, chain.roomId);
}

export async function deleteSenderKeyChain(roomId: string): Promise<void> {
  const db = await getDb();
  await db.delete(SENDER_KEY_STORE, roomId);
}

// ── Safety numbers (§1.6) ───────────────────────────────────────────────

export async function getSafetyNumber(
  peerUserId: string,
): Promise<string | null> {
  const db = await getDb();
  return (await db.get(SAFETY_NUMBERS_STORE, peerUserId)) ?? null;
}

export async function setSafetyNumber(
  peerUserId: string,
  fingerprint: string,
): Promise<void> {
  const db = await getDb();
  await db.put(SAFETY_NUMBERS_STORE, fingerprint, peerUserId);
}

export async function deleteSafetyNumber(peerUserId: string): Promise<void> {
  const db = await getDb();
  await db.delete(SAFETY_NUMBERS_STORE, peerUserId);
}
