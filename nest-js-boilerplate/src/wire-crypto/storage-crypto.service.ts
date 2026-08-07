import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { createHash, randomBytes } from 'node:crypto';
import type { StorageEnvelopeV1 } from './wire-crypto.types';

// Legacy prefix kept for backward compatibility with existing encrypted data.
const STORAGE_CONTEXT = 'e2ee-storage-v1';
const ROOM_STORAGE_CONTEXT = 'room-storage-v1';

/**
 * At-rest encryption for message bodies stored in Postgres.
 *
 * A per-user key is derived from `MESSAGE_STORAGE_MASTER_KEY` via HKDF, so a
 * Postgres dump / DB read reveals only ciphertext. The server (trusted
 * decryptor) derives the same key in memory on demand; the key never touches
 * Redis, the wire, or the client. Falls back to a key derived from
 * `ENCRYPTION_KEY` when the dedicated env is absent (dev convenience).
 */
@Injectable()
export class StorageCryptoService {
  private readonly masterKey: Uint8Array;
  private readonly logger = new Logger(StorageCryptoService.name);

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('MESSAGE_STORAGE_MASTER_KEY');
    if (raw) {
      this.masterKey = /^[0-9a-f]{64}$/i.test(raw)
        ? Buffer.from(raw, 'hex')
        : createHash('sha256').update(raw).digest();
    } else {
      const encryptionKey = this.config.get<string>('ENCRYPTION_KEY', 'dev');
      this.logger.warn(
        'MESSAGE_STORAGE_MASTER_KEY not set — deriving storage key from ENCRYPTION_KEY (dev fallback)',
      );
      this.masterKey = createHash('sha256')
        .update(`${encryptionKey}:storage`)
        .digest();
    }
  }

  private userKey(userId: string): Uint8Array {
    return hkdf(
      sha256,
      this.masterKey,
      new Uint8Array(0),
      new TextEncoder().encode(`${STORAGE_CONTEXT}:${userId}`),
      32,
    );
  }

  private roomKey(): Uint8Array {
    return hkdf(
      sha256,
      this.masterKey,
      new Uint8Array(0),
      new TextEncoder().encode(ROOM_STORAGE_CONTEXT),
      32,
    );
  }

  /**
   * Rebuild a flattened envelope from the v/ct/nonce columns. Returns null
   * when any piece is missing (e.g. a legacy row that never received an
   * envelope) so callers can degrade to an empty preview. The `v` is an
   * arbitrary string (client-supplied E2EE envelopes are stored verbatim),
   * so the result is not typed as the `storage-v1` literal — decryption
   * helpers validate `v` themselves.
   */
  toEnvelope(row: {
    v: string | null;
    ct: string | null;
    nonce: string | null;
  }): { v: string; ct: string; nonce: string } | null {
    if (!row.v || !row.ct || !row.nonce) return null;
    return { v: row.v, ct: row.ct, nonce: row.nonce };
  }

  /**
   * Flatten a wire/client-supplied at-rest envelope into the v/ct/nonce
   * columns. Returns null when the object is missing any of the three
   * string fields (or isn't an object at all) — the caller then encrypts
   * server-side instead of persisting a malformed envelope.
   */
  flattenEnvelope(
    envelope: unknown,
  ): { v: string; ct: string; nonce: string } | null {
    if (!envelope || typeof envelope !== 'object') return null;
    const { v, ct, nonce } = envelope as {
      v?: unknown;
      ct?: unknown;
      nonce?: unknown;
    };
    if (
      typeof v !== 'string' ||
      typeof ct !== 'string' ||
      typeof nonce !== 'string'
    ) {
      return null;
    }
    return { v, ct, nonce };
  }

  /**
   * Convert a stored MessageAttachment row (flattened v/ct/nonce columns)
   * into the wire/client shape `{url, type, name, storageEnvelope}`.
   *
   * The full-file ciphertext (`ct`) is deliberately omitted — it can be
   * megabytes for large uploads and would blow past the 64 KiB WS frame
   * cap.  The serve endpoint (`GET /upload/serve/:objectName`) reads the
   * envelope directly from PendingUpload, so the client never needs `ct`.
   */
  toWireAttachment(row: {
    url: string;
    type: string;
    name: string;
    size?: number;
    thumbnailUrl?: string | null;
    v: string | null;
    ct: string | null;
    nonce: string | null;
  }): {
    url: string;
    type: string;
    name: string;
    size: number;
    thumbnailUrl: string | null;
    storageEnvelope: { v: string; nonce: string } | null;
  } {
    const env = this.toEnvelope(row);
    return {
      url: row.url,
      type: row.type,
      name: row.name,
      size: row.size ?? 0,
      thumbnailUrl: row.thumbnailUrl ?? null,
      storageEnvelope: env ? { v: env.v, nonce: env.nonce } : null,
    };
  }

  /** Encrypt a JSON-serializable payload for at-rest storage. */
  encryptForStorage(userId: string, payload: unknown): StorageEnvelopeV1 {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(
      this.userKey(userId),
      nonce,
      new TextEncoder().encode(STORAGE_CONTEXT),
    );
    const ct = cipher.encrypt(
      new TextEncoder().encode(JSON.stringify(payload)),
    );
    return {
      v: 'storage-v1',
      nonce: nonce.toString('base64'),
      ct: Buffer.from(ct).toString('base64'),
    };
  }

  /** Decrypt an at-rest envelope. Returns the parsed payload. */
  decryptFromStorage(userId: string, envelope: unknown): unknown {
    const storage = envelope as Partial<StorageEnvelopeV1>;
    if (
      storage?.v !== 'storage-v1' ||
      typeof storage?.nonce !== 'string' ||
      typeof storage?.ct !== 'string'
    ) {
      throw new UnauthorizedException('Malformed at-rest envelope');
    }
    try {
      const cipher = xchacha20poly1305(
        this.userKey(userId),
        Buffer.from(storage.nonce, 'base64'),
        new TextEncoder().encode(STORAGE_CONTEXT),
      );
      const plain = cipher.decrypt(Buffer.from(storage.ct, 'base64'));
      return JSON.parse(Buffer.from(plain).toString('utf8')) as unknown;
    } catch {
      throw new UnauthorizedException('At-rest message decryption failed');
    }
  }

  /** Encrypt raw bytes (e.g. attachment files) for at-rest storage. */
  encryptBytes(userId: string, data: Uint8Array): StorageEnvelopeV1 {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(
      this.userKey(userId),
      nonce,
      new TextEncoder().encode(STORAGE_CONTEXT),
    );
    const ct = cipher.encrypt(data);
    return {
      v: 'storage-v1',
      nonce: nonce.toString('base64'),
      ct: Buffer.from(ct).toString('base64'),
    };
  }

  /** Decrypt raw bytes from an at-rest envelope. */
  decryptBytes(userId: string, envelope: unknown): Uint8Array {
    const storage = envelope as Partial<StorageEnvelopeV1>;
    if (
      storage?.v !== 'storage-v1' ||
      typeof storage?.nonce !== 'string' ||
      typeof storage?.ct !== 'string'
    ) {
      throw new UnauthorizedException('Malformed at-rest envelope');
    }
    try {
      const cipher = xchacha20poly1305(
        this.userKey(userId),
        Buffer.from(storage.nonce, 'base64'),
        new TextEncoder().encode(STORAGE_CONTEXT),
      );
      return cipher.decrypt(Buffer.from(storage.ct, 'base64'));
    } catch {
      throw new UnauthorizedException('At-rest file decryption failed');
    }
  }

  /** Encrypt a room message (shared key, readable by all room members). */
  encryptForRoom(payload: unknown): StorageEnvelopeV1 {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(
      this.roomKey(),
      nonce,
      new TextEncoder().encode(ROOM_STORAGE_CONTEXT),
    );
    const ct = cipher.encrypt(
      new TextEncoder().encode(JSON.stringify(payload)),
    );
    return {
      v: 'storage-v1',
      nonce: nonce.toString('base64'),
      ct: Buffer.from(ct).toString('base64'),
    };
  }

  /** Decrypt a room message envelope (shared key). */
  decryptForRoom(envelope: unknown): unknown {
    const storage = envelope as Partial<StorageEnvelopeV1>;
    if (
      storage?.v !== 'storage-v1' ||
      typeof storage?.nonce !== 'string' ||
      typeof storage?.ct !== 'string'
    ) {
      throw new UnauthorizedException('Malformed at-rest envelope');
    }
    try {
      const cipher = xchacha20poly1305(
        this.roomKey(),
        Buffer.from(storage.nonce, 'base64'),
        new TextEncoder().encode(ROOM_STORAGE_CONTEXT),
      );
      const plain = cipher.decrypt(Buffer.from(storage.ct, 'base64'));
      return JSON.parse(Buffer.from(plain).toString('utf8')) as unknown;
    } catch {
      throw new UnauthorizedException('At-rest room message decryption failed');
    }
  }
}
