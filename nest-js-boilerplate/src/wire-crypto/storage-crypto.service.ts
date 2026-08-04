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
