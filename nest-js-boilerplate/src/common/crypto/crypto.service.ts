import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Small, dependency-free crypto helpers shared by auth/MFA/email flows.
//  * Verification tokens are stored only as a SHA-256 hash (deterministic, so we can
//    look them up) — the raw token lives only in the email link.
//  * MFA TOTP secrets are encrypted at rest with AES-256-GCM (`secret Bytes` column).
@Injectable()
export class CryptoService implements OnModuleInit {
  private key!: Buffer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const raw = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    // Accept a 64-char hex key (32 bytes); otherwise derive 32 bytes via SHA-256.
    this.key = /^[0-9a-f]{64}$/i.test(raw)
      ? Buffer.from(raw, 'hex')
      : createHash('sha256').update(raw).digest();
  }

  /**
   * A URL-safe random token. The number of random bytes is derived from
   * TOKEN_LENGTH env var (default 90 chars) so all tokens meet the desired
   * length automatically.
   *
   *   bytes  = ceil(TOKEN_LENGTH * 3 / 4)
   *   output ≈ ceil(bytes * 4 / 3) chars base64url
   *
   * E.g. TOKEN_LENGTH=90 → 68 bytes → 91 chars; TOKEN_LENGTH=180 → 135 bytes → 180 chars.
   */
  randomToken(bytes?: number): string {
    const b = bytes ?? this.tokenBytes;
    return randomBytes(b).toString('base64url');
  }

  private get tokenBytes(): number {
    const chars = Number(this.config.get('TOKEN_LENGTH')) || 90;
    return Math.ceil((chars * 3) / 4);
  }

  /** Deterministic hash used to store/look up verification tokens and backup codes. */
  sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  /** HMAC-SHA256 for token derivation. Output is 64-char hex. */
  hmacSha256(key: string, data: string): string {
    return createHmac('sha256', key).update(data).digest('hex');
  }

  /** Timing-safe comparison of two hex strings. */
  timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
      return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
    } catch {
      return false;
    }
  }

  /** AES-256-GCM encrypt -> `iv(12) | authTag(16) | ciphertext` packed into one Buffer. */
  encrypt(plaintext: string): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  }

  /** Reverse of {@link encrypt}. */
  decrypt(packed: Buffer): string {
    const iv = packed.subarray(0, 12);
    const authTag = packed.subarray(12, 28);
    const ciphertext = packed.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }
}

/**
 * One-way fingerprint of a session id, safe to log or return over the API where the raw
 * value must never appear — `sessionId` IS the refresh-token bearer credential (it's set
 * directly as the refresh cookie and used as a plain Redis lookup key), not an opaque
 * correlation id. Exported as a pure function so call sites that don't already inject
 * `CryptoService` can use it too; same algorithm as {@link CryptoService.sha256}, so a hash
 * computed either way matches for cross-referencing (e.g. logs against the Settings UI).
 */
export function hashSessionId(sessionId: string): string {
  return createHash('sha256').update(sessionId).digest('hex');
}
