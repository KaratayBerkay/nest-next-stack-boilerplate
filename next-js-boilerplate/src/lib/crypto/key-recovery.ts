/**
 * E2EE key backup and restore.
 *
 * Enables users to export all of their local key material (identity keys,
 * signed prekey, one-time prekeys, ratchet sessions, sender key chains,
 * safety numbers, and the decrypted-message cache) to a JSON file, and to
 * re-import that file after clearing site data.
 *
 * Why the decrypted-message cache is included: old messages can only be
 * re-read after a wipe if their plaintext was persisted before the wipe —
 * the cached cache is the same mechanism the conversation re-decrypt path
 * already uses as a fallback (see `decryptMessages` in chat.ts).
 *
 * The backup file is plain JSON and must be stored somewhere the user
 * controls (local file, iCloud, etc.). It contains private key material —
 * treat it like a password.
 */

import { fromHex, toHex, xchachaDecrypt, xchachaEncrypt } from "./primitives";
import type { CachedDecryptedMessage } from "./store";
import type {
  DeviceIdentity,
  OneTimePrekey,
  RatchetSession,
  SenderKeyChain,
  SignedPrekey,
} from "./types";
import {
  cacheDecryptedMessage,
  getAllCachedDecryptedMessages,
  getAllOneTimePrekeys,
  getAllRatchetSessions,
  getAllSafetyNumbers,
  getAllSenderKeyChains,
  getIdentity,
  getIdentityAgreementPrivateKey,
  getIdentitySigningPrivateKey,
  getSignedPrekey,
  setIdentity,
  setIdentityAgreementPrivateKey,
  setIdentitySigningPrivateKey,
  setOneTimePrekey,
  setRatchetSession,
  setSafetyNumber,
  setSenderKeyChain,
  setSignedPrekey,
} from "./store";

export interface KeyBackupData {
  /** Backup format version — currently 1. */
  version: 1;
  /** ISO timestamp of when the backup was created. */
  createdAt: string;
  /** The account this backup belongs to. */
  ownUserId: string;
  /** The device ID the identity was registered with. */
  deviceId: string;
  identity: DeviceIdentity;
  identitySigningPrivateKey: string;
  identityAgreementPrivateKey: string;
  signedPrekey: SignedPrekey & { privateKey: string };
  oneTimePrekeys: Array<OneTimePrekey & { privateKey: string }>;
  ratchetSessions: RatchetSession[];
  senderKeyChains: SenderKeyChain[];
  safetyNumbers: Record<string, string>;
  cachedDecryptedMessages: CachedDecryptedMessage[];
}

/**
 * A password-encrypted backup. The payload is XChaCha20-Poly1305 over a
 * PBKDF2-SHA256-derived key; the salt is stored alongside so the key can
 * be re-derived on import. Safe to store on the server — the plaintext
 * backup never leaves the client unencrypted.
 */
export interface EncryptedKeyBackup {
  ciphertext: string;
  nonce: string;
  salt: string;
}

/** PBKDF2 iteration count for backup password derivation. */
const PBKDF2_ITERATIONS = 200_000;

async function deriveBackupKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    256,
  );
  return toHex(new Uint8Array(bits));
}

/** Encrypt a backup with a password-derived key. */
export async function encryptKeyBackup(
  backup: KeyBackupData,
  password: string,
): Promise<EncryptedKeyBackup> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveBackupKey(password, salt);
  const { ciphertext, nonce } = xchachaEncrypt(
    key,
    new TextEncoder().encode(JSON.stringify(backup)),
  );
  return { ciphertext, nonce, salt: toHex(salt) };
}

/** Decrypt a password-encrypted backup. Throws on wrong password or corrupt data. */
export async function decryptKeyBackup(
  encrypted: EncryptedKeyBackup,
  password: string,
): Promise<KeyBackupData> {
  const key = await deriveBackupKey(
    password,
    new Uint8Array(fromHex(encrypted.salt)),
  );
  const plaintext = xchachaDecrypt(key, encrypted.ciphertext, encrypted.nonce);
  const parsed = JSON.parse(
    new TextDecoder().decode(plaintext),
  ) as Partial<KeyBackupData>;
  if (parsed.version !== 1) {
    throw new Error("Unsupported backup version");
  }
  return parsed as KeyBackupData;
}

/**
 * Export every piece of E2EE state for the given account into a single
 * serializable object. Throws if the account has no usable key material.
 */
export async function exportE2eeKeys(
  ownUserId: string,
): Promise<KeyBackupData> {
  const identity = await getIdentity(ownUserId);
  if (!identity) {
    throw new Error("No identity found for export");
  }

  const signingPrivateKey = await getIdentitySigningPrivateKey(ownUserId);
  const agreementPrivateKey = await getIdentityAgreementPrivateKey(ownUserId);
  if (!signingPrivateKey || !agreementPrivateKey) {
    throw new Error("Private keys not found - cannot export");
  }

  const signedPrekey = await getSignedPrekey(ownUserId, 0);
  if (!signedPrekey) {
    throw new Error("No signed prekey found - cannot export");
  }

  const [
    oneTimePrekeys,
    ratchetSessions,
    senderKeyChains,
    safetyNumbers,
    cachedDecryptedMessages,
  ] = await Promise.all([
    getAllOneTimePrekeys(ownUserId),
    getAllRatchetSessions(ownUserId),
    getAllSenderKeyChains(ownUserId),
    getAllSafetyNumbers(ownUserId),
    getAllCachedDecryptedMessages(ownUserId),
  ]);

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    ownUserId,
    deviceId: identity.deviceId,
    identity,
    identitySigningPrivateKey: signingPrivateKey,
    identityAgreementPrivateKey: agreementPrivateKey,
    signedPrekey,
    oneTimePrekeys,
    ratchetSessions,
    senderKeyChains,
    safetyNumbers,
    cachedDecryptedMessages,
  };
}

/**
 * Restore E2EE state from a previously exported backup. Overwrites any
 * current state for the account (e.g. a fresh identity generated during
 * the window between the wipe and the import).
 */
export async function importE2eeKeys(
  ownUserId: string,
  backup: KeyBackupData,
): Promise<void> {
  if (backup.ownUserId !== ownUserId) {
    throw new Error("This backup belongs to a different account");
  }

  await setIdentity(ownUserId, backup.identity);
  await setIdentitySigningPrivateKey(
    ownUserId,
    backup.identitySigningPrivateKey,
  );
  await setIdentityAgreementPrivateKey(
    ownUserId,
    backup.identityAgreementPrivateKey,
  );

  if (backup.signedPrekey) {
    await setSignedPrekey(
      ownUserId,
      backup.signedPrekey.keyId,
      backup.signedPrekey,
    );
  }

  for (const opk of backup.oneTimePrekeys) {
    await setOneTimePrekey(ownUserId, opk.keyId, opk);
  }

  for (const session of backup.ratchetSessions) {
    await setRatchetSession(ownUserId, session);
  }

  for (const chain of backup.senderKeyChains) {
    await setSenderKeyChain(ownUserId, chain);
  }

  for (const [peerUserId, fingerprint] of Object.entries(
    backup.safetyNumbers,
  )) {
    await setSafetyNumber(ownUserId, peerUserId, fingerprint);
  }

  for (const message of backup.cachedDecryptedMessages) {
    await cacheDecryptedMessage(ownUserId, message);
  }
}

/** True when the account has a usable identity + private keys. */
export async function hasE2eeKeys(ownUserId: string): Promise<boolean> {
  const identity = await getIdentity(ownUserId);
  if (!identity) return false;

  const signingKey = await getIdentitySigningPrivateKey(ownUserId);
  const agreementKey = await getIdentityAgreementPrivateKey(ownUserId);

  return !!(signingKey && agreementKey);
}

/** Trigger a browser download of the backup as a JSON file. */
export function downloadKeyBackup(backup: KeyBackupData): void {
  downloadJsonFile(backup, `eys-e2ee-backup-${backup.deviceId}.json`);
}

/** Trigger a browser download of a password-encrypted backup file. */
export function downloadEncryptedKeyBackup(
  encrypted: EncryptedKeyBackup,
  deviceId: string,
): void {
  downloadJsonFile(encrypted, `eys-e2ee-backup-${deviceId}.encrypted.json`);
}

function downloadJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export type ParsedKeyBackupFile =
  | { kind: "plain"; backup: KeyBackupData }
  | { kind: "encrypted"; encrypted: EncryptedKeyBackup };

/**
 * Read a backup file picked by the user and validate its shape. Accepts
 * both plaintext (version-1) and password-encrypted backups. Throws on
 * unsupported versions or malformed content.
 */
export async function parseKeyBackupFile(
  file: File,
): Promise<ParsedKeyBackupFile> {
  const parsed = JSON.parse(await file.text()) as Partial<KeyBackupData> &
    Partial<EncryptedKeyBackup>;

  if (
    typeof parsed.ciphertext === "string" &&
    typeof parsed.nonce === "string" &&
    typeof parsed.salt === "string"
  ) {
    return {
      kind: "encrypted",
      encrypted: {
        ciphertext: parsed.ciphertext,
        nonce: parsed.nonce,
        salt: parsed.salt,
      },
    };
  }

  if (parsed.version !== 1) {
    throw new Error("Unsupported backup version");
  }
  if (!parsed.ownUserId || !parsed.identity) {
    throw new Error("Invalid backup file");
  }
  return { kind: "plain", backup: parsed as KeyBackupData };
}
