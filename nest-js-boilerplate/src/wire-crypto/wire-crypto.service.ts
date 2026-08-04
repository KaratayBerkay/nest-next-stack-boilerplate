import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { randomBytes } from 'node:crypto';
import Redis from 'ioredis';
import { parseDurationToSeconds } from '../common/utils/parse-duration';
import { REDIS_CLIENT } from '../redis/redis.tokens';
import { WIRE_CRYPTO_CONTEXT, type WireEnvelopeV2 } from './wire-crypto.types';

// ── Redis key prefixes ───────────────────────────────────────────────────

/** Legacy per-session keys (ephemeral, tied to JWT session). */
const SESSION_KEY_PREFIX = 'crypto:session:';
const SEQ_PREFIX = 'crypto:seq:';

/** Persistent per-device keys (survive page reloads, tied to device token). */
const DEVICE_KEY_PREFIX = 'crypto:device:';
const DEVICE_SEQ_PREFIX = 'crypto:device-seq:';
const DEVICE_KEY_TTL_DAYS = 90;

export type WireDirection = 'c2s' | 's2c';

/**
 * Per-device wire encryption (trusted-server model).
 *
 * Redis key layout:
 *   crypto:device:<deviceHash>  HASH { pub, priv, peerPub, key }
 *   crypto:device-seq:<deviceHash>:<dir>  integer — monotonic frame counter
 *
 * Fallback (no device token):
 *   crypto:session:<sessionId>  HASH { pub, priv, peerPub, key }
 *   crypto:seq:<sessionId>:<dir>  integer
 *
 * The server keypair is created at handshake; the client posts its device
 * public key via `POST /api/crypto/handshake`. ECDH + HKDF derives the
 * shared secret. Device keys persist for 90 days; session keys follow the
 * JWT session TTL.
 */
@Injectable()
export class WireCryptoService {
  private readonly ttl: number;
  private readonly deviceTtl: number;
  private readonly logger = new Logger(WireCryptoService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('SESSION_TTL', '900s');
    this.ttl = parseDurationToSeconds(raw);
    this.deviceTtl = DEVICE_KEY_TTL_DAYS * 86400;
  }

  // ── Key helpers ──────────────────────────────────────────────────────

  private deviceKey(deviceHash: string): string {
    return `${DEVICE_KEY_PREFIX}${deviceHash}`;
  }

  private deviceSeqKey(deviceHash: string, direction: WireDirection): string {
    return `${DEVICE_SEQ_PREFIX}${deviceHash}:${direction}`;
  }

  private sessionKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }

  private seqKey(sessionId: string, direction: WireDirection): string {
    return `${SEQ_PREFIX}${sessionId}:${direction}`;
  }

  // ── Device-based key management (persistent) ─────────────────────────

  /** Generate a server keypair for a device. Returns the public key (hex). */
  async createDeviceKeys(deviceHash: string): Promise<string> {
    const priv = x25519.utils.randomSecretKey();
    const pub = x25519.getPublicKey(priv);
    const pubHex = bytesToHex(pub);
    await this.redis.hset(this.deviceKey(deviceHash), {
      pub: pubHex,
      priv: bytesToHex(priv),
      peerPub: '',
      key: '',
    });
    await this.redis.expire(this.deviceKey(deviceHash), this.deviceTtl);
    this.logger.debug(`createDeviceKeys deviceHash=${deviceHash}`);
    return pubHex;
  }

  /** Get the server public key for a device. */
  async getDevicePublicKey(deviceHash: string): Promise<string | null> {
    return (await this.redis.hget(this.deviceKey(deviceHash), 'pub')) ?? null;
  }

  /** Check if a device already has stored keys. */
  async hasDeviceKeys(deviceHash: string): Promise<boolean> {
    return (await this.redis.exists(this.deviceKey(deviceHash))) === 1;
  }

  /**
   * Accept the client's public key for a device and derive the shared secret
   * (ECDH + HKDF). If the device already has a server keypair, re-derives
   * using the existing private key. Idempotent.
   */
  async setDevicePeerPublicKey(
    deviceHash: string,
    peerPubHex: string,
  ): Promise<void> {
    let privHex = await this.redis.hget(this.deviceKey(deviceHash), 'priv');
    if (!privHex) {
      // First handshake for this device — generate server keypair.
      await this.createDeviceKeys(deviceHash);
      privHex = await this.redis.hget(this.deviceKey(deviceHash), 'priv');
    }
    if (!privHex) {
      this.logger.error(`setDevicePeerPublicKey: failed to create keys for ${deviceHash}`);
      return;
    }
    const shared = x25519.getSharedSecret(
      hexToBytes(privHex),
      hexToBytes(peerPubHex),
    );
    const derived = hkdf(
      sha256,
      shared,
      new Uint8Array(0),
      new TextEncoder().encode(`${WIRE_CRYPTO_CONTEXT}:${deviceHash}`),
      32,
    );
    await this.redis.hset(this.deviceKey(deviceHash), {
      peerPub: peerPubHex,
      key: bytesToHex(derived),
    });
    await this.redis.expire(this.deviceKey(deviceHash), this.deviceTtl);
    this.logger.debug(`setDevicePeerPublicKey deviceHash=${deviceHash}`);
  }

  /** Get the derived shared key for a device. */
  async getDeviceSharedKey(deviceHash: string): Promise<string | null> {
    return (await this.redis.hget(this.deviceKey(deviceHash), 'key')) ?? null;
  }

  /** Flush all crypto material for a device (re-key / revocation). */
  async deleteDeviceKeys(deviceHash: string): Promise<void> {
    const pipe = this.redis.multi();
    pipe.del(this.deviceKey(deviceHash));
    pipe.del(this.deviceSeqKey(deviceHash, 'c2s'));
    pipe.del(this.deviceSeqKey(deviceHash, 's2c'));
    await pipe.exec();
    this.logger.debug(`deleteDeviceKeys deviceHash=${deviceHash}`);
  }

  // ── Session-based key management (fallback, ephemeral) ───────────────

  /** Generate and store a fresh server keypair for a session. Returns the public key (hex). */
  async createSessionKeys(sessionId: string): Promise<string> {
    const priv = x25519.utils.randomSecretKey();
    const pub = x25519.getPublicKey(priv);
    const pubHex = bytesToHex(pub);
    await this.redis.hset(this.sessionKey(sessionId), {
      pub: pubHex,
      priv: bytesToHex(priv),
      peerPub: '',
      key: '',
    });
    await this.redis.expire(this.sessionKey(sessionId), this.ttl);
    this.logger.debug(`createSessionKeys sessionId=${sessionId}`);
    return pubHex;
  }

  async getServerPublicKey(sessionId: string): Promise<string | null> {
    const pub = await this.redis.hget(this.sessionKey(sessionId), 'pub');
    return pub ?? null;
  }

  async hasKeys(sessionId: string): Promise<boolean> {
    return (await this.redis.exists(this.sessionKey(sessionId))) === 1;
  }

  /**
   * Accept the client's device public key and derive the shared secret
   * (ECDH + HKDF). Idempotent — re-handshakes just re-derive.
   */
  async setPeerPublicKey(sessionId: string, peerPubHex: string): Promise<void> {
    const key = this.sessionKey(sessionId);
    const privHex = await this.redis.hget(key, 'priv');
    if (!privHex) {
      this.logger.warn(`setPeerPublicKey: no session keys for ${sessionId}`);
      return;
    }
    const shared = x25519.getSharedSecret(
      hexToBytes(privHex),
      hexToBytes(peerPubHex),
    );
    const derived = hkdf(
      sha256,
      shared,
      new Uint8Array(0),
      new TextEncoder().encode(`${WIRE_CRYPTO_CONTEXT}:${sessionId}`),
      32,
    );
    await this.redis.hset(key, {
      peerPub: peerPubHex,
      key: bytesToHex(derived),
    });
    await this.redis.expire(key, this.ttl);
    this.logger.debug(`setPeerPublicKey sessionId=${sessionId}`);
  }

  // ── Encryption / Decryption (device-first, session fallback) ─────────

  /**
   * Resolve the shared key for a connection. Checks device keys first,
   * then falls back to session keys.
   */
  private async resolveKey(
    deviceHash: string | undefined,
    sessionId: string,
  ): Promise<{ keyHex: string; aadContext: string } | null> {
    // Try device-based key first (persistent).
    if (deviceHash) {
      const deviceKey = await this.getDeviceSharedKey(deviceHash);
      if (deviceKey) {
        return { keyHex: deviceKey, aadContext: deviceHash };
      }
    }
    // Fall back to session-based key (ephemeral).
    const sessionKey = await this.redis.hget(this.sessionKey(sessionId), 'key');
    if (sessionKey) {
      return { keyHex: sessionKey, aadContext: sessionId };
    }
    return null;
  }

  /**
   * Server→client encryption. Uses device key if available, session key as
   * fallback. The AAD context is the device hash or sessionId.
   */
  async encryptForSession(
    sessionId: string,
    payload: unknown,
    deviceHash?: string,
  ): Promise<WireEnvelopeV2> {
    const resolved = await this.resolveKey(deviceHash, sessionId);
    if (!resolved) {
      throw new UnauthorizedException('No wire-crypto session established');
    }
    const { keyHex, aadContext } = resolved;
    const seqKey = deviceHash
      ? this.deviceSeqKey(deviceHash, 's2c')
      : this.seqKey(sessionId, 's2c');
    const seq = await this.nextSeqWithKey(seqKey);
    const aad = this.buildAad(aadContext, 's2c', seq);
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(
      hexToBytes(keyHex),
      nonce,
      new TextEncoder().encode(aad),
    );
    const ct = cipher.encrypt(
      new TextEncoder().encode(JSON.stringify(payload)),
    );
    return {
      v: 2,
      nonce: nonce.toString('base64'),
      ct: Buffer.from(ct).toString('base64'),
    };
  }

  /** Client→server decryption. Rejects malformed, replayed, or tampered frames. */
  async decryptFromClient(
    sessionId: string,
    envelope: unknown,
    deviceHash?: string,
  ): Promise<unknown> {
    const wire = envelope as Partial<WireEnvelopeV2>;
    if (
      wire?.v !== 2 ||
      typeof wire?.nonce !== 'string' ||
      typeof wire?.ct !== 'string'
    ) {
      throw new BadRequestException('Malformed wire envelope');
    }
    const resolved = await this.resolveKey(deviceHash, sessionId);
    if (!resolved) {
      throw new UnauthorizedException('No wire-crypto session established');
    }
    const { keyHex, aadContext } = resolved;
    const seqKey = deviceHash
      ? this.deviceSeqKey(deviceHash, 'c2s')
      : this.seqKey(sessionId, 'c2s');
    const seq = await this.nextSeqWithKey(seqKey);
    const aad = this.buildAad(aadContext, 'c2s', seq);
    try {
      const cipher = xchacha20poly1305(
        hexToBytes(keyHex),
        Buffer.from(wire.nonce, 'base64'),
        new TextEncoder().encode(aad),
      );
      const plain = cipher.decrypt(Buffer.from(wire.ct, 'base64'));
      return JSON.parse(Buffer.from(plain).toString('utf8')) as unknown;
    } catch {
      throw new UnauthorizedException('Wire message decryption failed');
    }
  }

  // ── TTL management ───────────────────────────────────────────────────

  /** Slide the session crypto TTL together with the session. */
  async touchTTL(sessionId: string): Promise<void> {
    if (!sessionId) return;
    const exists = await this.redis.exists(this.sessionKey(sessionId));
    if (!exists) return;
    await this.redis.expire(this.sessionKey(sessionId), this.ttl);
  }

  /** Drop all crypto material for a session (logout / revocation). */
  async deleteForSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    const pipe = this.redis.multi();
    pipe.del(this.sessionKey(sessionId));
    pipe.del(this.seqKey(sessionId, 'c2s'));
    pipe.del(this.seqKey(sessionId, 's2c'));
    await pipe.exec();
    this.logger.debug(`deleteForSession sessionId=${sessionId}`);
  }

  // ── Sequence counter helpers ──────────────────────────────────────────

  private async nextSeqWithKey(key: string): Promise<number> {
    const pipe = this.redis.multi();
    pipe.incr(key);
    pipe.expire(key, this.deviceTtl);
    const res = await pipe.exec();
    const first = res?.[0];
    return Number(first?.[1] ?? 1);
  }

  private async nextSeq(
    sessionId: string,
    direction: WireDirection,
  ): Promise<number> {
    const key = this.seqKey(sessionId, direction);
    const pipe = this.redis.multi();
    pipe.incr(key);
    pipe.expire(key, this.ttl);
    const res = await pipe.exec();
    const first = res?.[0];
    return Number(first?.[1] ?? 1);
  }

  private buildAad(
    context: string,
    direction: WireDirection,
    seq: number,
  ): string {
    return `${WIRE_CRYPTO_CONTEXT}|${context}|${direction}|${seq}`;
  }
}
