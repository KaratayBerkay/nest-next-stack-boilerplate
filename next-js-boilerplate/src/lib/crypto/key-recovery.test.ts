/**
 * Key backup/restore round-trip test.
 *
 * Verifies that:
 * 1. exportE2eeKeys captures every piece of E2EE state
 * 2. After a simulated site-data wipe (all stores cleared), importE2eeKeys
 *    restores identity keys, prekeys, ratchet sessions, sender key chains,
 *    safety numbers, and the decrypted-message cache
 * 3. hasE2eeKeys reflects the restored state
 * 4. parseKeyBackupFile rejects unsupported versions
 *
 * All state lives in an in-memory mock of IndexedDB — no real browser
 * or backend needed.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── In-memory store ─────────────────────────────────────────────────────

const identities = new Map<string, unknown>();
const prekeys = new Map<string, unknown>();
const sessions = new Map<string, unknown>();
const chains = new Map<string, unknown>();
const safetyNumbers = new Map<string, string>();
const cache = new Map<string, unknown>();

vi.mock("./store", () => ({
  getIdentity: vi.fn((ownUserId: string) =>
    Promise.resolve(identities.get(ownUserId) ?? null),
  ),
  setIdentity: vi.fn((ownUserId: string, id: unknown) => {
    identities.set(ownUserId, id);
    return Promise.resolve();
  }),
  getIdentitySigningPrivateKey: vi.fn((ownUserId: string) =>
    Promise.resolve((prekeys.get(`${ownUserId}:signing`) as string) ?? null),
  ),
  setIdentitySigningPrivateKey: vi.fn((ownUserId: string, key: string) => {
    prekeys.set(`${ownUserId}:signing`, key);
    return Promise.resolve();
  }),
  getIdentityAgreementPrivateKey: vi.fn((ownUserId: string) =>
    Promise.resolve((prekeys.get(`${ownUserId}:agreement`) as string) ?? null),
  ),
  setIdentityAgreementPrivateKey: vi.fn((ownUserId: string, key: string) => {
    prekeys.set(`${ownUserId}:agreement`, key);
    return Promise.resolve();
  }),
  getSignedPrekey: vi.fn((ownUserId: string, keyId: number) =>
    Promise.resolve(prekeys.get(`${ownUserId}:spk-${keyId}`) ?? null),
  ),
  setSignedPrekey: vi.fn((ownUserId: string, keyId: number, spk: unknown) => {
    prekeys.set(`${ownUserId}:spk-${keyId}`, spk);
    return Promise.resolve();
  }),
  getOneTimePrekey: vi.fn((ownUserId: string, keyId: string) =>
    Promise.resolve(prekeys.get(`${ownUserId}:otpk-${keyId}`) ?? null),
  ),
  setOneTimePrekey: vi.fn((ownUserId: string, keyId: string, opk: unknown) => {
    prekeys.set(`${ownUserId}:otpk-${keyId}`, opk);
    return Promise.resolve();
  }),
  getAllOneTimePrekeys: vi.fn((ownUserId: string) => {
    const results: unknown[] = [];
    for (const [key, value] of prekeys.entries()) {
      if (key.startsWith(`${ownUserId}:otpk-`)) results.push(value);
    }
    return Promise.resolve(results);
  }),
  getRatchetSession: vi.fn((_ownUserId: string, peerUserId: string) =>
    Promise.resolve(sessions.get(peerUserId) ?? null),
  ),
  setRatchetSession: vi.fn(
    (_ownUserId: string, session: { peerUserId: string }) => {
      sessions.set(session.peerUserId, session);
      return Promise.resolve();
    },
  ),
  getAllRatchetSessions: vi.fn(() => Promise.resolve([...sessions.values()])),
  getSenderKeyChain: vi.fn((_ownUserId: string, roomId: string) =>
    Promise.resolve(chains.get(roomId) ?? null),
  ),
  setSenderKeyChain: vi.fn((_ownUserId: string, chain: { roomId: string }) => {
    chains.set(chain.roomId, chain);
    return Promise.resolve();
  }),
  getAllSenderKeyChains: vi.fn(() => Promise.resolve([...chains.values()])),
  getSafetyNumber: vi.fn((_ownUserId: string, peerUserId: string) =>
    Promise.resolve(safetyNumbers.get(peerUserId) ?? null),
  ),
  setSafetyNumber: vi.fn(
    (_ownUserId: string, peerUserId: string, fingerprint: string) => {
      safetyNumbers.set(peerUserId, fingerprint);
      return Promise.resolve();
    },
  ),
  getAllSafetyNumbers: vi.fn(() =>
    Promise.resolve(Object.fromEntries(safetyNumbers.entries())),
  ),
  getCachedDecryptedMessage: vi.fn((_ownUserId: string, messageId: string) =>
    Promise.resolve(cache.get(messageId) ?? null),
  ),
  cacheDecryptedMessage: vi.fn(
    (_ownUserId: string, message: { messageId: string }) => {
      cache.set(message.messageId, message);
      return Promise.resolve();
    },
  ),
  getAllCachedDecryptedMessages: vi.fn(() =>
    Promise.resolve([...cache.values()]),
  ),
}));

// Re-import after mock
import {
  exportE2eeKeys,
  importE2eeKeys,
  hasE2eeKeys,
  parseKeyBackupFile,
} from "./key-recovery";
import type { KeyBackupData } from "./key-recovery";

const OWN_USER_ID = "user-1";
const PEER_USER_ID = "user-2";

function seedState() {
  identities.set(OWN_USER_ID, {
    v: 1,
    deviceId: "device-abc",
    identitySigningKey: "ik-sig-pub",
    identityAgreementKey: "ik-dh-pub",
    identityAgreementKeySignature: "ik-dh-sig",
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  prekeys.set(`${OWN_USER_ID}:signing`, "ik-sig-priv");
  prekeys.set(`${OWN_USER_ID}:agreement`, "ik-dh-priv");
  prekeys.set(`${OWN_USER_ID}:spk-0`, {
    keyId: 0,
    publicKey: "spk-pub",
    signature: "spk-sig",
    createdAt: "2026-08-01T00:00:00.000Z",
    privateKey: "spk-priv",
  });
  prekeys.set(`${OWN_USER_ID}:otpk-1`, {
    keyId: "1",
    publicKey: "otpk-1-pub",
    privateKey: "otpk-1-priv",
  });
  prekeys.set(`${OWN_USER_ID}:otpk-2`, {
    keyId: "2",
    publicKey: "otpk-2-pub",
    privateKey: "otpk-2-priv",
  });
  sessions.set(PEER_USER_ID, {
    peerUserId: PEER_USER_ID,
    peerDeviceId: "device-peer",
    rootKey: "root",
    sendingChainKey: "send",
    receivingChainKey: "recv",
    dhPub: "dh-pub",
    dhPriv: "dh-priv",
    peerDhPub: "peer-dh-pub",
    sendingChainIndex: 3,
    previousSendingChainLength: 0,
    receivingChainIndex: 5,
    receivingChainCount: 5,
    skippedMessageKeys: {},
    updatedAt: "2026-08-02T00:00:00.000Z",
  });
  chains.set("room-1", {
    roomId: "room-1",
    epoch: 1,
    chainKey: "room-chain",
    chainIndex: 2,
  });
  safetyNumbers.set(PEER_USER_ID, "fp-1234");
  cache.set("msg-1", {
    messageId: "msg-1",
    peerUserId: PEER_USER_ID,
    body: "hello from the cache",
    senderId: PEER_USER_ID,
    recipientId: OWN_USER_ID,
    createdAt: "2026-08-02T00:00:00.000Z",
  });
}

function wipeAll() {
  identities.clear();
  prekeys.clear();
  sessions.clear();
  chains.clear();
  safetyNumbers.clear();
  cache.clear();
}

beforeEach(() => {
  wipeAll();
  seedState();
});

describe("exportE2eeKeys", () => {
  it("captures every piece of E2EE state", async () => {
    const backup = await exportE2eeKeys(OWN_USER_ID);

    expect(backup.version).toBe(1);
    expect(backup.ownUserId).toBe(OWN_USER_ID);
    expect(backup.deviceId).toBe("device-abc");
    expect(backup.identity.identitySigningKey).toBe("ik-sig-pub");
    expect(backup.identitySigningPrivateKey).toBe("ik-sig-priv");
    expect(backup.identityAgreementPrivateKey).toBe("ik-dh-priv");
    expect(backup.signedPrekey.privateKey).toBe("spk-priv");
    expect(backup.oneTimePrekeys).toHaveLength(2);
    expect(backup.ratchetSessions).toHaveLength(1);
    expect(backup.ratchetSessions[0].peerUserId).toBe(PEER_USER_ID);
    expect(backup.senderKeyChains).toHaveLength(1);
    expect(backup.senderKeyChains[0].roomId).toBe("room-1");
    expect(backup.safetyNumbers[PEER_USER_ID]).toBe("fp-1234");
    expect(backup.cachedDecryptedMessages).toHaveLength(1);
    expect(backup.cachedDecryptedMessages[0].body).toBe("hello from the cache");
  });

  it("throws when no identity exists", async () => {
    identities.clear();
    await expect(exportE2eeKeys(OWN_USER_ID)).rejects.toThrow(
      "No identity found",
    );
  });

  it("throws when private keys are missing", async () => {
    prekeys.delete(`${OWN_USER_ID}:signing`);
    await expect(exportE2eeKeys(OWN_USER_ID)).rejects.toThrow(
      "Private keys not found",
    );
  });
});

describe("importE2eeKeys after a site-data wipe", () => {
  it("restores identity, keys, sessions, and cache", async () => {
    const backup = await exportE2eeKeys(OWN_USER_ID);

    // Simulate clearing site data
    wipeAll();
    expect(await hasE2eeKeys(OWN_USER_ID)).toBe(false);

    // Restore from backup
    await importE2eeKeys(OWN_USER_ID, backup);
    expect(await hasE2eeKeys(OWN_USER_ID)).toBe(true);

    const restored = await exportE2eeKeys(OWN_USER_ID);
    expect(restored.identity.identitySigningKey).toBe("ik-sig-pub");
    expect(restored.identitySigningPrivateKey).toBe("ik-sig-priv");
    expect(restored.identityAgreementPrivateKey).toBe("ik-dh-priv");
    expect(restored.signedPrekey.privateKey).toBe("spk-priv");
    expect(restored.oneTimePrekeys).toHaveLength(2);
    expect(restored.ratchetSessions[0].peerUserId).toBe(PEER_USER_ID);
    expect(restored.senderKeyChains[0].roomId).toBe("room-1");
    expect(restored.safetyNumbers[PEER_USER_ID]).toBe("fp-1234");
    expect(restored.cachedDecryptedMessages[0].body).toBe(
      "hello from the cache",
    );
  });

  it("rejects a backup that belongs to a different account", async () => {
    const backup = await exportE2eeKeys(OWN_USER_ID);
    await expect(importE2eeKeys("user-99", backup)).rejects.toThrow(
      "different account",
    );
  });
});

describe("hasE2eeKeys", () => {
  it("is false after a wipe and true after restore", async () => {
    const backup = await exportE2eeKeys(OWN_USER_ID);
    wipeAll();
    expect(await hasE2eeKeys(OWN_USER_ID)).toBe(false);

    await importE2eeKeys(OWN_USER_ID, backup);
    expect(await hasE2eeKeys(OWN_USER_ID)).toBe(true);
  });
});

describe("parseKeyBackupFile", () => {
  it("parses a valid version-1 backup", async () => {
    const backup = await exportE2eeKeys(OWN_USER_ID);
    const file = new File([JSON.stringify(backup)], "backup.json", {
      type: "application/json",
    });
    const parsed: KeyBackupData = await parseKeyBackupFile(file);
    expect(parsed.version).toBe(1);
    expect(parsed.ownUserId).toBe(OWN_USER_ID);
  });

  it("rejects an unsupported version", async () => {
    const file = new File(
      [JSON.stringify({ version: 99, ownUserId: OWN_USER_ID })],
      "backup.json",
      { type: "application/json" },
    );
    await expect(parseKeyBackupFile(file)).rejects.toThrow(
      "Unsupported backup version",
    );
  });
});
