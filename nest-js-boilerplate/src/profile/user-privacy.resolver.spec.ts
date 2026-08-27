import { UserPrivacyResolver } from './user-privacy.resolver';
import type { User } from '../@generated/user/user.model';
import type { JwtUser } from '../auth/auth.types';

function row(overrides: Partial<User> & { hideAvatar?: boolean }): User {
  return {
    id: 'owner-1',
    avatarUrl: 'https://cdn/a.webp',
    ...overrides,
  } as unknown as User;
}

function viewer(userId: string): JwtUser {
  return { userId } as JwtUser;
}

describe('UserPrivacyResolver', () => {
  const resolver = new UserPrivacyResolver();

  describe('avatarUrl', () => {
    it('withholds the avatar from OTHER users when hideAvatar is on — regression: the users search, meeting host, and stream broadcaster surfaces leaked it', () => {
      expect(
        resolver.avatarUrl(row({ hideAvatar: true }), viewer('someone-else')),
      ).toBeNull();
    });

    it('keeps the avatar for the owner themselves', () => {
      expect(
        resolver.avatarUrl(row({ hideAvatar: true }), viewer('owner-1')),
      ).toBe('https://cdn/a.webp');
    });

    it('passes the avatar through when hideAvatar is off', () => {
      expect(
        resolver.avatarUrl(row({ hideAvatar: false }), viewer('someone-else')),
      ).toBe('https://cdn/a.webp');
    });

    it('cannot redact a row selected without hideAvatar (undefined) — behaves as before this resolver existed', () => {
      expect(resolver.avatarUrl(row({}), viewer('someone-else'))).toBe(
        'https://cdn/a.webp',
      );
    });

    it('does not redact on viewer-less (public auth-mutation) surfaces, where the row is always the caller own', () => {
      expect(resolver.avatarUrl(row({ hideAvatar: true }), undefined)).toBe(
        'https://cdn/a.webp',
      );
    });
  });

  describe('hideAvatar (owner-only readback — keeps Flutter myProfile { hideAvatar } valid)', () => {
    it('returns the real value to the owner', () => {
      expect(
        resolver.hideAvatar(row({ hideAvatar: true }), viewer('owner-1')),
      ).toBe(true);
    });

    it('returns false to anyone else regardless of the real value', () => {
      expect(
        resolver.hideAvatar(row({ hideAvatar: true }), viewer('someone-else')),
      ).toBe(false);
    });
  });

  describe('mfaEnabled (owner-only)', () => {
    it('never reveals another user 2FA posture', () => {
      expect(
        resolver.mfaEnabled(row({ mfaEnabled: true }), viewer('someone-else')),
      ).toBe(false);
    });

    it('returns the real value on own-row surfaces (login/verifyLoginMfa payloads)', () => {
      expect(resolver.mfaEnabled(row({ mfaEnabled: true }), undefined)).toBe(
        true,
      );
    });
  });

  describe('emailVerifiedAt (owner-only)', () => {
    const at = new Date('2026-01-01T00:00:00Z');

    it('resolves for the owner (web verifyEmailCode selects it)', () => {
      expect(
        resolver.emailVerifiedAt(
          row({ emailVerifiedAt: at }),
          viewer('owner-1'),
        ),
      ).toEqual(at);
    });

    it('is null for everyone else', () => {
      expect(
        resolver.emailVerifiedAt(
          row({ emailVerifiedAt: at }),
          viewer('someone-else'),
        ),
      ).toBeNull();
    });
  });
});
