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
import { hashForRedisKey } from '../common/token-codec/token-codec';
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

/**
 * How many seq numbers `decryptFromClient` scans back on an AEAD failure
 * before giving up. Frames lost in transit (deploys killing open sockets,
 * dropped packets) leave the client's sendSeq ahead of the server counter;
 * a match within this window is realigned transparently instead of dropping
 * every subsequent frame. Bounded so a garbage-flooding client can't turn
 * one frame into an unbounded decrypt loop.
 */
const C2S_LOOKBACK_WINDOW = 16;

/**
 * Highest TRUE c2s seq accepted per device/session. The raw counter above
 * advances on every received frame (even failed decrypts), so it can't tell
 * a replay from a lost-frame recovery — this key can. Written on every
 * successful decrypt, read only on lookback matches.
 */
const LAST_C2S_PREFIX = 'crypto:last-c2s:';

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

  // Keyed HMAC (hashForRedisKey), not the raw sessionId directly: the raw
  // value was previously used as a literal, unhashed Redis key — anyone
  // holding the refresh_token cookie (== sessionId) could compute this key
  // themselves. deviceHash-based keys are untouched — device_token stays
  // unwrapped everywhere (see token-codec.ts's doc comment for why).
  private sessionKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${hashForRedisKey(sessionId)}`;
  }

  private seqKey(sessionId: string, direction: WireDirection): string {
    return `${SEQ_PREFIX}${hashForRedisKey(sessionId)}:${direction}`;
  }

  /** Key holding the highest TRUE c2s seq accepted for a device/session. */
  private lastC2sKey(
    deviceHash: string | undefined,
    sessionId: string,
  ): string {
    return deviceHash
      ? `${LAST_C2S_PREFIX}${deviceHash}`
      : `${LAST_C2S_PREFIX}${hashForRedisKey(sessionId)}`;
  }

  /** TTL for seq counters / replay gates — device keys outlive sessions. */
  private seqTtl(deviceHash: string | undefined): number {
    return deviceHash ? this.deviceTtl : this.ttl;
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
      this.logger.error(
        `setDevicePeerPublicKey: failed to create keys for ${deviceHash}`,
      );
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
    const seq = await this.nextSeqWithKey(seqKey, deviceHash);
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
    const seq = await this.nextSeqWithKey(seqKey, deviceHash);

    // The AAD is bound to an exact seq, so the counter must be incremented
    // BEFORE decryption (the frame's own seq is unknowable until it
    // decrypts). Frames lost in transit (a deploy killing an open socket,
    // dropped packets) leave the client's sendSeq AHEAD of the counter —
    // the exact seq fails, and without recovery every later frame fails AEAD
    // forever (max-adoption keeps the inflated local seq and each retry only
    // burns the counter further). Scan a window around the counter:
    //   • ahead  (seq+k): the common lost-frame case — the true seq is
    //     higher than the counter because the server never saw the gap.
    //   • behind (seq-k): a stale client / multi-tab lag.
    // A match at M ≠ seq means the in-between seqs never arrived. Realign
    // the counter to M so the client's next frame (M+1) decrypts exactly,
    // and accept this frame — the in-flight message is delivered instead of
    // dropped. Matches at or below the last ACCEPTED seq are replays and
    // stay rejected (each decrypt attempt is ~µs, and the window is bounded,
    // so a garbage-flooding client can't turn this into a decrypt bomb).
    const keyBytes = hexToBytes(keyHex);
    const nonce = Buffer.from(wire.nonce, 'base64');
    const ct = Buffer.from(wire.ct, 'base64');
    const candidates: number[] = [seq];
    for (let k = 1; k <= C2S_LOOKBACK_WINDOW; k++) candidates.push(seq + k);
    for (let k = 1; k <= C2S_LOOKBACK_WINDOW && seq - k >= 1; k++) {
      candidates.push(seq - k);
    }
    for (const s of candidates) {
      const cipher = xchacha20poly1305(
        keyBytes,
        nonce,
        new TextEncoder().encode(this.buildAad(aadContext, 'c2s', s)),
      );
      let plain: Uint8Array;
      try {
        plain = cipher.decrypt(ct);
      } catch {
        continue;
      }
      if (s !== seq) {
        const last = Number(
          (await this.redis.get(this.lastC2sKey(deviceHash, sessionId))) ?? 0,
        );
        if (s <= last) {
          throw new UnauthorizedException('Wire message decryption failed');
        }
        // Realign the counter to the frame's true seq + persist it as the
        // highest accepted seq, atomically.
        const pipe = this.redis.multi();
        pipe.set(seqKey, String(s));
        pipe.expire(seqKey, this.seqTtl(deviceHash));
        pipe.set(this.lastC2sKey(deviceHash, sessionId), String(s));
        pipe.expire(
          this.lastC2sKey(deviceHash, sessionId),
          this.seqTtl(deviceHash),
        );
        await pipe.exec();
      } else {
        // Exact match — fresh by construction (the counter only realigns to
        // an accepted seq, so the next exact seq is always above it).
        // Persist as the highest accepted seq for replay gating.
        const pipe = this.redis.multi();
        pipe.set(this.lastC2sKey(deviceHash, sessionId), String(s));
        pipe.expire(
          this.lastC2sKey(deviceHash, sessionId),
          this.seqTtl(deviceHash),
        );
        await pipe.exec();
      }
      return JSON.parse(Buffer.from(plain).toString('utf8')) as unknown;
    }
    throw new UnauthorizedException('Wire message decryption failed');
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

  /**
   * Read the current device counter for a direction WITHOUT incrementing.
   * Used by the handshake to let clients resync their local sendSeq/recvSeq
   * after multi-tab divergence or dropped frames. Returns 0 when the device
   * has never sent/received in that direction.
   */
  async getDeviceSeq(
    deviceHash: string,
    direction: WireDirection,
  ): Promise<number> {
    const raw = await this.redis.get(this.deviceSeqKey(deviceHash, direction));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  /** Read the current session counter for a direction WITHOUT incrementing. */
  async getSessionSeq(
    sessionId: string,
    direction: WireDirection,
  ): Promise<number> {
    const raw = await this.redis.get(this.seqKey(sessionId, direction));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  /** Current c2s/s2c counters for the key material a connection will use. */
  async getCounters(
    deviceHash: string | undefined,
    sessionId: string,
  ): Promise<{ c2sSeq: number; s2cSeq: number }> {
    if (deviceHash) {
      return {
        c2sSeq: await this.getDeviceSeq(deviceHash, 'c2s'),
        s2cSeq: await this.getDeviceSeq(deviceHash, 's2c'),
      };
    }
    return {
      c2sSeq: await this.getSessionSeq(sessionId, 'c2s'),
      s2cSeq: await this.getSessionSeq(sessionId, 's2c'),
    };
  }

  private async nextSeqWithKey(
    key: string,
    deviceHash: string | undefined,
  ): Promise<number> {
    const pipe = this.redis.multi();
    pipe.incr(key);
    pipe.expire(key, this.seqTtl(deviceHash));
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
