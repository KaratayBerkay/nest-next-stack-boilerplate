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

const DB_VERSION = 3;

// ── Store names ─────────────────────────────────────────────────────────

const IDENTITY_STORE = "identity";
const PREKEYS_STORE = "prekeys";
const RATCHET_STORE = "ratchet";
const SENDER_KEY_STORE = "senderKeys";
const SAFETY_NUMBERS_STORE = "safetyNumbers";
const DECRYPTED_MESSAGES_STORE = "decryptedMessages";

// ── Database singleton (one per user) ───────────────────────────────────

const dbPromises = new Map<string, Promise<IDBPDatabase>>();

function getDb(ownUserId: string): Promise<IDBPDatabase> {
  let dbPromise = dbPromises.get(ownUserId);
  if (!dbPromise) {
    dbPromise = openDB(`e2ee:${ownUserId}`, DB_VERSION, {
      upgrade(db, _oldVersion, _newVersion, _transaction) {
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
        if (!db.objectStoreNames.contains(DECRYPTED_MESSAGES_STORE)) {
          const store = db.createObjectStore(DECRYPTED_MESSAGES_STORE, {
            keyPath: "messageId",
          });
          store.createIndex("peerUserId", "peerUserId");
          store.createIndex("createdAt", "createdAt");
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

/** Enumerate every ratchet session — used for key backup/export. */
export async function getAllRatchetSessions(
  ownUserId: string,
): Promise<RatchetSession[]> {
  const db = await getDb(ownUserId);
  return db.getAll(RATCHET_STORE);
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

/** Enumerate every sender key chain — used for key backup/export. */
export async function getAllSenderKeyChains(
  ownUserId: string,
): Promise<SenderKeyChain[]> {
  const db = await getDb(ownUserId);
  return db.getAll(SENDER_KEY_STORE);
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

/** Enumerate every stored safety number — used for key backup/export. */
export async function getAllSafetyNumbers(
  ownUserId: string,
): Promise<Record<string, string>> {
  const db = await getDb(ownUserId);
  const allKeys = await db.getAllKeys(SAFETY_NUMBERS_STORE);
  const result: Record<string, string> = {};
  for (const key of allKeys) {
    if (typeof key !== "string") continue;
    const value = await db.get(SAFETY_NUMBERS_STORE, key);
    if (value) result[key] = value;
  }
  return result;
}

// ── Decrypted message cache ────────────────────────────────────────────
//
// Persist the plaintext of successfully decrypted messages so they survive
// page reloads and ratchet session loss. The cache is keyed by messageId
// and indexed by peerUserId for efficient conversation lookups. This is
// the same strategy Signal/WhatsApp use — decrypted plaintext is stored
// locally while ciphertext lives on the server.

export interface CachedDecryptedMessage {
  messageId: string;
  peerUserId: string;
  body: string;
  senderId: string;
  recipientId: string;
  createdAt: string;
  decryptedAttachment?: {
    key: string;
    nonce: string;
    originalName: string;
    originalType: string;
    originalSize: number;
  };
}

/**
 * Cache a successfully decrypted message. Called after every successful
 * ratchet decrypt so that the plaintext survives page reloads and session
 * loss.
 */
export async function cacheDecryptedMessage(
  ownUserId: string,
  message: CachedDecryptedMessage,
): Promise<void> {
  const db = await getDb(ownUserId);
  await db.put(DECRYPTED_MESSAGES_STORE, message);
}

/**
 * Retrieve a single cached decrypted message by its ID.
 */
export async function getCachedDecryptedMessage(
  ownUserId: string,
  messageId: string,
): Promise<CachedDecryptedMessage | null> {
  const db = await getDb(ownUserId);
  return (await db.get(DECRYPTED_MESSAGES_STORE, messageId)) ?? null;
}

/**
 * Retrieve all cached decrypted messages for a specific conversation,
 * sorted by createdAt ascending (oldest first).
 */
export async function getCachedDecryptedMessagesForPeer(
  ownUserId: string,
  peerUserId: string,
): Promise<CachedDecryptedMessage[]> {
  const db = await getDb(ownUserId);
  const index = db
    .transaction(DECRYPTED_MESSAGES_STORE)
    .store.index("peerUserId");
  return index.getAll(peerUserId);
}

/**
 * Get a Map of messageId → CachedDecryptedMessage for a peer, for fast
 * lookup when merging with server messages.
 */
export async function getCachedDecryptedMessagesMap(
  ownUserId: string,
  peerUserId: string,
): Promise<Map<string, CachedDecryptedMessage>> {
  const messages = await getCachedDecryptedMessagesForPeer(
    ownUserId,
    peerUserId,
  );
  return new Map(messages.map((m) => [m.messageId, m]));
}

/**
 * Clear the decrypted message cache for a specific peer, or all peers
 * if peerUserId is omitted. Called on conversation reset or logout.
 */
export async function clearCachedDecryptedMessages(
  ownUserId: string,
  peerUserId?: string,
): Promise<void> {
  const db = await getDb(ownUserId);
  if (peerUserId) {
    const index = db
      .transaction(DECRYPTED_MESSAGES_STORE, "readwrite")
      .store.index("peerUserId");
    let cursor = await index.openCursor(peerUserId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  } else {
    await db.clear(DECRYPTED_MESSAGES_STORE);
  }
}

/** Enumerate every cached decrypted message — used for key backup/export. */
export async function getAllCachedDecryptedMessages(
  ownUserId: string,
): Promise<CachedDecryptedMessage[]> {
  const db = await getDb(ownUserId);
  return db.getAll(DECRYPTED_MESSAGES_STORE);
}
