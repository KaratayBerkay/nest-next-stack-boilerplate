import { _resetKeysForTests } from './id-codec';
import {
  deepDecryptIds,
  deepEncryptIds,
  encryptFieldIfId,
} from './id-codec.util';

describe('id-codec.util', () => {
  const UUID_A = '01890a5d-ac96-774b-bcce-b302099a8057';
  const UUID_B = '01890a5d-ac96-774b-bcce-b302099a8058';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-id-codec-specs';
    _resetKeysForTests();
  });

  it('deep-encrypts nested and array-of-string id fields, leaves everything else untouched', () => {
    const input = {
      id: UUID_A,
      email: 'a@example.com',
      author: { id: UUID_B, name: 'x' },
      // authorId isn't really an array anywhere in the schema — this is
      // purely exercising the walker's "array under a matching key" branch.
      authorId: [UUID_A, UUID_B],
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    const out = deepEncryptIds(input) as typeof input & {
      author: { id: string };
    };
    expect(out.id).not.toBe(UUID_A);
    expect(out.author.id).not.toBe(UUID_B);
    expect(out.email).toBe('a@example.com');
    expect(out.createdAt).toBeInstanceOf(Date);
    expect(out.authorId[0]).not.toBe(UUID_A);
  });

  it('round-trips encrypt then decrypt back to the original', () => {
    const input = { id: UUID_A, authorId: UUID_B, name: 'unchanged' };
    const encrypted = deepEncryptIds(input);
    const decrypted = deepDecryptIds(encrypted);
    expect(decrypted).toEqual(input);
  });

  it('treats a REST/WS-level roomId as a real uuid field (RtcRoom-backed FK), unlike the GraphQL per-model roomId on RoomMessage', () => {
    // No REST/WS payload ever puts RoomMessage's routing slug under the key
    // "roomId" — that model's own wire boundary (messaging.controller.ts's
    // `rooms/:roomSlug/...` routes, messaging-ws.gateway.ts's `room`/`slug`
    // frame keys) deliberately never spells it that way. So at the flat,
    // no-model-context REST/WS layer, "roomId" is unambiguously the
    // RtcRoom-backed uuid FK shared by CallSession/Meeting/LiveStream/etc.
    const input = { roomId: UUID_A, id: UUID_B };
    const out = deepEncryptIds(input) as typeof input;
    expect(out.roomId).not.toBe(UUID_A);
    expect(out.id).not.toBe(UUID_B);
    expect(deepDecryptIds(out)).toEqual(input);
  });

  it('encryptFieldIfId only transforms a field the given GraphQL type actually owns as a uuid', () => {
    expect(encryptFieldIfId('Post', 'authorId', UUID_A)).not.toBe(UUID_A);
    expect(encryptFieldIfId('RoomMessage', 'roomId', 'general')).toBe(
      'general',
    );
    expect(encryptFieldIfId('RoomParticipant', 'roomId', UUID_A)).not.toBe(
      UUID_A,
    );
    expect(encryptFieldIfId('Post', 'title', 'hello')).toBe('hello');
  });

  it("encryptFieldIfId falls back to the flat global set for a hand-written GraphQL type that has no matching Prisma model (e.g. SessionUserPayload, the `me` query's return type) — regression for a live bug where `me { id }` shipped the raw uuid", () => {
    expect(encryptFieldIfId('SessionUserPayload', 'id', UUID_A)).not.toBe(
      UUID_A,
    );
    expect(encryptFieldIfId('SessionUserPayload', 'deviceId', UUID_A)).not.toBe(
      UUID_A,
    );
    // Still correctly leaves a non-id field alone on an unrecognized type.
    expect(encryptFieldIfId('SessionUserPayload', 'email', 'a@x.com')).toBe(
      'a@x.com',
    );
    // roomId is unambiguous at the flat/fallback level too now (see
    // uuid-fields.spec.ts) — the fallback path picks up the same global set.
    expect(encryptFieldIfId('SomeHandRolledType', 'roomId', UUID_A)).not.toBe(
      UUID_A,
    );
  });

  it('encryptFieldIfId catches deviceId on every hand-written type that has one, not just SessionInfo — AuthPayload.deviceId (register/login/refresh/loginWithOAuth/verifyLoginMfa) is the same gap on a completely separate class', () => {
    expect(encryptFieldIfId('AuthPayload', 'deviceId', UUID_A)).not.toBe(
      UUID_A,
    );
    expect(encryptFieldIfId('SessionInfo', 'deviceId', UUID_A)).not.toBe(
      UUID_A,
    );
    // sessionId on SessionInfo is already a one-way hash (hashSessionId), not
    // a uuid — must never be run through encryptId (uuidToBytes would throw
    // on a 64-char hex hash). Confirms it correctly stays unrecognized.
    const hash = 'a'.repeat(64);
    expect(encryptFieldIfId('SessionInfo', 'sessionId', hash)).toBe(hash);
  });
});
