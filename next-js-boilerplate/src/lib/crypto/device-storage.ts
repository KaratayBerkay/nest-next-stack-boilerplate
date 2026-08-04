/**
 * Persistent device key storage for wire encryption.
 *
 * Keys are stored in IndexedDB (primary) with localStorage fallback.
 * This ensures key pairs survive page reloads and work on older browsers
 * that lack IndexedDB support.
 *
 * The device token (from the auth cookie) is also mirrored to localStorage
 * so the crypto system can look up the correct key pair without reading
 * the httpOnly cookie.
 */

const DEVICE_TOKEN_KEY = "crypto:device-token";
const KEYS_KEY_PREFIX = "crypto:keys:";
const DB_NAME = "wire-crypto";
const DB_STORE = "keys";
const DB_VERSION = 1;

export interface DeviceKeyPair {
  clientPrivKey: string; // hex
  clientPubKey: string; // hex
}

// ── IndexedDB helpers ────────────────────────────────────────────────────

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// ── localStorage helpers ─────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

function lsDelete(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

// ── Device token ─────────────────────────────────────────────────────────

/** Get the device token from localStorage (mirrored from the auth cookie). */
export function getDeviceToken(): string | null {
  return lsGet<string>(DEVICE_TOKEN_KEY);
}

/** Store the device token in localStorage (called after login/refresh). */
export function setDeviceToken(token: string): void {
  lsSet(DEVICE_TOKEN_KEY, token);
}

/** Clear the device token from localStorage. */
export function clearDeviceToken(): void {
  lsDelete(DEVICE_TOKEN_KEY);
}

// ── Key pair storage ─────────────────────────────────────────────────────

function keysStorageKey(deviceToken: string): string {
  return `${KEYS_KEY_PREFIX}${deviceToken}`;
}

/**
 * Load stored keys for a device token.
 * Tries IndexedDB first, falls back to localStorage.
 */
export async function loadKeys(
  deviceToken: string,
): Promise<DeviceKeyPair | null> {
  const key = keysStorageKey(deviceToken);

  // Try IndexedDB first.
  const idbKeys = await idbGet<DeviceKeyPair>(key);
  if (idbKeys) return idbKeys;

  // Fall back to localStorage.
  return lsGet<DeviceKeyPair>(key);
}

/**
 * Persist keys for a device token to both IndexedDB and localStorage.
 */
export async function storeKeys(
  deviceToken: string,
  keys: DeviceKeyPair,
): Promise<void> {
  const key = keysStorageKey(deviceToken);

  // Write to both stores in parallel — best effort.
  await Promise.allSettled([idbSet(key, keys)]);
  lsSet(key, keys);
}

/**
 * Flush all stored keys and device token (on decryption failure / logout).
 */
export async function flushKeys(deviceToken: string): Promise<void> {
  const key = keysStorageKey(deviceToken);

  await Promise.allSettled([idbDelete(key)]);
  lsDelete(key);
}

/**
 * Full flush: clear device token + all keys from both stores.
 */
export async function flushAll(): Promise<void> {
  const token = getDeviceToken();
  if (token) {
    await flushKeys(token);
  }
  clearDeviceToken();

  // Also sweep any orphaned localStorage keys.
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(KEYS_KEY_PREFIX) || k === DEVICE_TOKEN_KEY)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => lsDelete(k));
  } catch {
    // Ignore.
  }
}
