import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { TextEncoder } from 'node:util';
import { WireCryptoService } from './wire-crypto.service';
import { WIRE_CRYPTO_CONTEXT } from './wire-crypto.types';

function createRedisMock() {
  const store = new Map<string, Record<string, string>>();
  const counters = new Map<string, number>();

  function applyHset(
    key: string,
    fieldOrData: string | Record<string, string>,
    value?: string,
  ) {
    const existing = store.get(key) ?? {};
    if (typeof fieldOrData === 'string' && value !== undefined) {
      store.set(key, { ...existing, [fieldOrData]: value });
    } else {
      store.set(key, {
        ...existing,
        ...(fieldOrData as Record<string, string>),
      });
    }
  }

  return {
    multi: jest.fn(() => {
      const ops: Array<() => [Error | null, unknown]> = [];
      return {
        hset: (key: string, f: string | Record<string, string>, v?: string) => {
          ops.push(() => {
            applyHset(key, f, v);
            return [null, 1];
          });
        },
        expire: (_key: string) => {
          ops.push(() => [null, 1]);
        },
        incr: (key: string) => {
          ops.push(() => {
            const n = (counters.get(key) ?? 0) + 1;
            counters.set(key, n);
            return [null, n];
          });
        },
        set: (key: string, value: string | number) => {
          ops.push(() => {
            counters.set(key, Number(value));
            return [null, 'OK'];
          });
        },
        del: (key: string) => {
          ops.push(() => {
            const ok = store.has(key);
            store.delete(key);
            counters.delete(key);
            return [null, ok ? 1 : 0];
          });
        },
        exec: () => Promise.resolve(ops.map((fn) => fn())),
      };
    }),
    hset: jest.fn(
      (key: string, f: string | Record<string, string>, v?: string) => {
        applyHset(key, f, v);
        return Promise.resolve(1);
      },
    ),
    hget: jest.fn((key: string, field: string) =>
      Promise.resolve(store.get(key)?.[field] ?? null),
    ),
    get: jest.fn((key: string) =>
      Promise.resolve(counters.get(key)?.toString() ?? null),
    ),
    exists: jest.fn((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
    expire: jest.fn(() => Promise.resolve(1)),
    del: jest.fn(() => Promise.resolve(1)),
    _store: store,
  };
}

function buildService(redis = createRedisMock()) {
  const service = new WireCryptoService(
    redis as never,
    new ConfigService({ SESSION_TTL: '900s' }),
  );
  return { service, redis };
}

/** Simulate the client half: ECDH(devicePriv, serverPub) + HKDF → shared key. */
function clientSharedKey(
  devicePrivHex: string,
  serverPubHex: string,
  sessionId: string,
) {
  const shared = x25519.getSharedSecret(
    hexToBytes(devicePrivHex),
    hexToBytes(serverPubHex),
  );
  return hkdf(
    sha256,
    shared,
    new Uint8Array(0),
    new TextEncoder().encode(`${WIRE_CRYPTO_CONTEXT}:${sessionId}`),
    32,
  );
}

function encryptLikeClient(
  key: Uint8Array,
  aad: string,
  payload: unknown,
): { nonce: string; ct: string } {
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const cipher = xchacha20poly1305(key, nonce, new TextEncoder().encode(aad));
  const ct = cipher.encrypt(new TextEncoder().encode(JSON.stringify(payload)));
  return {
    nonce: Buffer.from(nonce).toString('base64'),
    ct: Buffer.from(ct).toString('base64'),
  };
}

function decryptLikeClient(
  key: Uint8Array,
  aad: string,
  envelope: { nonce: string; ct: string },
): unknown {
  const cipher = xchacha20poly1305(
    key,
    Buffer.from(envelope.nonce, 'base64'),
    new TextEncoder().encode(aad),
  );
  const plain = cipher.decrypt(Buffer.from(envelope.ct, 'base64'));
  return JSON.parse(Buffer.from(plain).toString('utf8'));
}

describe('WireCryptoService', () => {
  const SID = 'test-session-1';

  it('creates a session keypair and returns the public half', async () => {
    const { service, redis } = buildService();
    const pub = await service.createSessionKeys(SID);
    expect(pub).toMatch(/^[0-9a-f]{64}$/);
    expect(redis._store.get(`crypto:session:${SID}`)?.pub).toBe(pub);
    expect(redis._store.get(`crypto:session:${SID}`)?.priv).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it('agrees on a shared secret with a real client keypair', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));

    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    // Server → client: client must be able to decrypt with its own derived key.
    const envelope = await service.encryptForSession(SID, {
      text: 'secret hello',
    });
    const aadS2c = `${WIRE_CRYPTO_CONTEXT}|${SID}|s2c|1`;
    expect(decryptLikeClient(clientKey, aadS2c, envelope)).toEqual({
      text: 'secret hello',
    });

    // Client → server: server must accept a client-encrypted frame.
    const aadC2s = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|1`;
    const frame = encryptLikeClient(clientKey, aadC2s, {
      text: 'secret reply',
    });
    expect(await service.decryptFromClient(SID, { v: 2, ...frame })).toEqual({
      text: 'secret reply',
    });
  });

  it('rejects tampered or replayed frames', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    const aadC2s = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|1`;
    const frame = encryptLikeClient(clientKey, aadC2s, {
      text: 'do not tamper',
    });

    const tampered = {
      v: 2,
      nonce: frame.nonce,
      ct: 'AAAA' + frame.ct.slice(4),
    };
    await expect(
      service.decryptFromClient(SID, tampered),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // The intact original frame was never ACCEPTED (the tampered attempt
    // consumed seq 1 and was rejected), so under the loss-recovery semantics
    // it is now a legitimate delayed frame — the server walks the window and
    // delivers it. True replay protection (re-accepting an already-accepted
    // frame) is asserted in the dedicated replay-gate test below.
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame }),
    ).resolves.toEqual({ text: 'do not tamper' });
  });

  it('rejects malformed envelopes', async () => {
    const { service } = buildService();
    await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    await service.setPeerPublicKey(
      SID,
      bytesToHex(x25519.getPublicKey(devicePriv)),
    );
    await expect(service.decryptFromClient(SID, { v: 1 })).rejects.toThrow();
    await expect(service.decryptFromClient(SID, null)).rejects.toThrow();
  });

  it('fails encrypt/decrypt when no shared secret is established', async () => {
    const { service } = buildService();
    await service.createSessionKeys(SID);
    await expect(service.encryptForSession(SID, {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      service.decryptFromClient(SID, { v: 2, nonce: '', ct: '' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('touches and deletes session material', async () => {
    const { service, redis } = buildService();
    await service.createSessionKeys(SID);
    await service.touchTTL(SID);
    expect(redis.expire).toHaveBeenCalledWith(`crypto:session:${SID}`, 900);

    await service.deleteForSession(SID);
    expect(redis._store.get(`crypto:session:${SID}`)).toBeUndefined();
    expect(await service.hasKeys(SID)).toBe(false);
  });

  it('returns 0 counters before any traffic and live counters after', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    const before = await service.getCounters(undefined, SID);
    expect(before).toEqual({ c2sSeq: 0, s2cSeq: 0 });

    // One s2c frame (encryptForSession) and one c2s frame (decryptFromClient).
    await service.encryptForSession(SID, { text: 'a' });
    const aadC2s = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|1`;
    const frame = encryptLikeClient(clientKey, aadC2s, { text: 'b' });
    await service.decryptFromClient(SID, { v: 2, ...frame });

    const after = await service.getCounters(undefined, SID);
    expect(after).toEqual({ c2sSeq: 1, s2cSeq: 1 });
    expect(await service.getSessionSeq(SID, 'c2s')).toBe(1);
    expect(await service.getSessionSeq(SID, 's2c')).toBe(1);
  });

  it('resyncs a client ahead of the server counter without inventing traffic', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    // Client sends 5 frames (server processes them all), then the client
    // reloads with a stale local seq of 2 — the handshake counters expose
    // the truth so the client can adopt max(2, 5) = 5.
    for (let i = 1; i <= 5; i++) {
      const aad = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|${i}`;
      const frame = encryptLikeClient(clientKey, aad, { text: `m${i}` });
      await service.decryptFromClient(SID, { v: 2, ...frame });
    }
    const { c2sSeq } = await service.getCounters(undefined, SID);
    expect(c2sSeq).toBe(5);

    // Next client frame must use seq 6, not the stale 3.
    const aad6 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|6`;
    const next = encryptLikeClient(clientKey, aad6, { text: 'after reload' });
    await expect(
      service.decryptFromClient(SID, { v: 2, ...next }),
    ).resolves.toEqual({ text: 'after reload' });
  });

  it('recovers a client ahead of the server counter (lost frames) and realigns', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    // Server processes frames 1..2, then frames 3..5 are LOST in transit
    // (e.g. a deploy killed the socket). The client's local sendSeq is 5
    // while the server counter is 2 — the pre-fix behavior rejected every
    // later frame forever (max-adoption keeps the inflated local seq).
    for (let i = 1; i <= 2; i++) {
      const aad = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|${i}`;
      const frame = encryptLikeClient(clientKey, aad, { text: `m${i}` });
      await service.decryptFromClient(SID, { v: 2, ...frame });
    }

    // The client's next frame uses its local seq 6; the server must walk
    // back to 6-...-4, land on the true seq, realign, and ACCEPT it.
    const aad6 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|6`;
    const frame6 = encryptLikeClient(clientKey, aad6, {
      text: 'in-flight lost frame',
    });
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame6 }),
    ).resolves.toEqual({ text: 'in-flight lost frame' });

    // Counter realigned to 6 — the client's next frame (seq 7) matches
    // exactly, session continues seamlessly with no resync round-trip.
    const { c2sSeq } = await service.getCounters(undefined, SID);
    expect(c2sSeq).toBe(6);
    const aad7 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|7`;
    const frame7 = encryptLikeClient(clientKey, aad7, { text: 'after heal' });
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame7 }),
    ).resolves.toEqual({ text: 'after heal' });
  });

  it('rejects replays even when they land inside the lookback window', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    const aad1 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|1`;
    const frame1 = encryptLikeClient(clientKey, aad1, { text: 'original' });
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame1 }),
    ).resolves.toEqual({ text: 'original' });

    // Replaying the exact frame would walk back to seq 1 and "match" — the
    // last-accepted-seq gate must reject it instead of delivering a dup.
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // A fresh frame on the realigned counter still works.
    const aad2 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|2`;
    const frame2 = encryptLikeClient(clientKey, aad2, { text: 'fresh' });
    await expect(
      service.decryptFromClient(SID, { v: 2, ...frame2 }),
    ).resolves.toEqual({ text: 'fresh' });
  });

  it('does not recover when the gap exceeds the lookback window', async () => {
    const { service } = buildService();
    const serverPub = await service.createSessionKeys(SID);
    const devicePriv = x25519.utils.randomSecretKey();
    const devicePub = bytesToHex(x25519.getPublicKey(devicePriv));
    await service.setPeerPublicKey(SID, devicePub);
    const clientKey = clientSharedKey(bytesToHex(devicePriv), serverPub, SID);

    // Server at counter 1; the client jumped 64 seqs ahead (large loss) —
    // outside the 16-wide window, so the frame is rejected and the client
    // recovers via the crypto-resync → handshake path instead.
    const aad1 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|1`;
    await service.decryptFromClient(SID, {
      v: 2,
      ...encryptLikeClient(clientKey, aad1, { text: 'm1' }),
    });
    const aad65 = `${WIRE_CRYPTO_CONTEXT}|${SID}|c2s|65`;
    await expect(
      service.decryptFromClient(SID, {
        v: 2,
        ...encryptLikeClient(clientKey, aad65, { text: 'too far' }),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
