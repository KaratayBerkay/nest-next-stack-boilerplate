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

const SESSION_KEY_PREFIX = 'crypto:session:';
const SEQ_PREFIX = 'crypto:seq:';

export type WireDirection = 'c2s' | 's2c';

/**
 * Per-session wire encryption (trusted-server model).
 *
 * Redis key layout (TTL = SESSION_TTL, slid with the session):
 *   crypto:session:<sessionId>  HASH { pub, priv, peerPub, key }
 *   crypto:seq:<sessionId>:<dir>  integer — monotonic frame counter, part of AAD
 *
 * The server keypair is created at login/refresh (`createSessionKeys`); the
 * client posts its device public key via `POST /api/crypto/handshake` and the
 * shared secret is derived server-side (ECDH + HKDF). `encryptForSession`
 * produces server→client envelopes; `decryptFromClient` consumes client→server
 * ones. Private keys never leave Redis.
 */
@Injectable()
export class WireCryptoService {
  private readonly ttl: number;
  private readonly logger = new Logger(WireCryptoService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('SESSION_TTL', '900s');
    this.ttl = parseDurationToSeconds(raw);
  }

  private sessionKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }

  private seqKey(sessionId: string, direction: WireDirection): string {
    return `${SEQ_PREFIX}${sessionId}:${direction}`;
  }

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

  /** Server→client encryption of an arbitrary JSON-serializable payload. */
  async encryptForSession(
    sessionId: string,
    payload: unknown,
  ): Promise<WireEnvelopeV2> {
    const keyHex = await this.redis.hget(this.sessionKey(sessionId), 'key');
    if (!keyHex) {
      throw new UnauthorizedException('No wire-crypto session established');
    }
    const seq = await this.nextSeq(sessionId, 's2c');
    const aad = this.buildAad(sessionId, 's2c', seq);
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
  ): Promise<unknown> {
    const wire = envelope as Partial<WireEnvelopeV2>;
    if (
      wire?.v !== 2 ||
      typeof wire?.nonce !== 'string' ||
      typeof wire?.ct !== 'string'
    ) {
      throw new BadRequestException('Malformed wire envelope');
    }
    const keyHex = await this.redis.hget(this.sessionKey(sessionId), 'key');
    if (!keyHex) {
      throw new UnauthorizedException('No wire-crypto session established');
    }
    const seq = await this.nextSeq(sessionId, 'c2s');
    const aad = this.buildAad(sessionId, 'c2s', seq);
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
    sessionId: string,
    direction: WireDirection,
    seq: number,
  ): string {
    return `${WIRE_CRYPTO_CONTEXT}|${sessionId}|${direction}|${seq}`;
  }
}
