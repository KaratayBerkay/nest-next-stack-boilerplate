import type { ConfigService } from '@nestjs/config';
import { decryptId, _resetKeysForTests } from '../common/id-codec/id-codec';
import { LiveKitService, toLivekitRoomName } from './livekit.service';

// MOB-034: the server hands clients the ws(s) URL they should connect to, so
// no client needs its own compile-time copy that can drift (the Flutter app
// shipped connecting to ws://localhost:7880 — its own loopback).
describe('LiveKitService.clientUrl', () => {
  const configWith = (env: Record<string, string>): ConfigService =>
    ({
      get: (key: string, fallback?: string) => env[key] ?? fallback,
    }) as unknown as ConfigService;

  it('exposes LIVEKIT_URL, trimmed, when configured', () => {
    const svc = new LiveKitService(
      configWith({ LIVEKIT_URL: ' wss://livekit.example.com ' }),
    );
    expect(svc.clientUrl).toBe('wss://livekit.example.com');
  });

  it('is null (clients fall back to their own config) when unset or blank', () => {
    expect(new LiveKitService(configWith({})).clientUrl).toBeNull();
    expect(
      new LiveKitService(configWith({ LIVEKIT_URL: '   ' })).clientUrl,
    ).toBeNull();
  });

  it('is distinct from the server-side admin endpoint LIVEKIT_HTTP_URL', () => {
    const svc = new LiveKitService(
      configWith({ LIVEKIT_HTTP_URL: 'http://host.docker.internal:7880' }),
    );
    expect(svc.clientUrl).toBeNull();
  });
});

// Regression for the 2026-08-28 finding that LiveKit room names embedded the
// raw database uuid (`call-<uuid>`). Room names ride the signed LiveKit
// access token, are readable off every peer's Room object, and appear in
// webhooks and client telemetry — the same client-visible surface the
// id-codec exists to protect. The id half must be the encrypted token form.
describe('toLivekitRoomName', () => {
  const RAW_ID = '01a047d3-3157-733c-8add-56c4311cbfe5';
  const UUID_RE =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-livekit-specs';
    _resetKeysForTests();
  });

  it('never embeds the raw uuid in the room name', () => {
    for (const kind of ['call', 'meeting', 'stream'] as const) {
      const name = toLivekitRoomName(kind, RAW_ID);
      expect(name.startsWith(`${kind}-`)).toBe(true);
      expect(name).not.toContain(RAW_ID);
      expect(UUID_RE.test(name)).toBe(false);
    }
  });

  it('stays deterministic and operator-decryptable for debugging', () => {
    const name = toLivekitRoomName('call', RAW_ID);
    expect(toLivekitRoomName('call', RAW_ID)).toBe(name);
    expect(decryptId(name.slice('call-'.length))).toBe(RAW_ID);
  });
});
