import { decryptId, _resetKeysForTests } from '../common/id-codec/id-codec';
import { toLivekitRoomName } from './livekit.service';

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
