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

  it('leaves a non-uuid roomId (routing slug) untouched even though the name looks id-shaped', () => {
    const input = { roomId: 'general', id: UUID_A };
    const out = deepEncryptIds(input) as typeof input;
    expect(out.roomId).toBe('general');
    expect(out.id).not.toBe(UUID_A);
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
    // And still safe for the ambiguous name even via the fallback path.
    expect(encryptFieldIfId('SomeHandRolledType', 'roomId', 'general')).toBe(
      'general',
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
