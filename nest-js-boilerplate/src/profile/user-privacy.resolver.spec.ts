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

function viewer(userId: string, role = 'USER'): JwtUser {
  return { userId, role } as JwtUser;
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

  describe('role/status (CROSS-044 — moderation metadata redacted from ordinary peers)', () => {
    it('redacts another user role to USER for a non-privileged viewer — regression: { users(search) { role } } exposed admin/moderator accounts to any session', () => {
      expect(
        resolver.role(row({ role: 'ADMIN' }), viewer('someone-else')),
      ).toBe('USER');
    });

    it('redacts another user status to ACTIVE for a non-privileged viewer — BANNED/SUSPENDED is target-selection intel', () => {
      expect(
        resolver.status(row({ status: 'BANNED' }), viewer('someone-else')),
      ).toBe('ACTIVE');
    });

    it('keeps real values for the owner themselves', () => {
      expect(resolver.role(row({ role: 'MODERATOR' }), viewer('owner-1'))).toBe(
        'MODERATOR',
      );
      expect(
        resolver.status(row({ status: 'SUSPENDED' }), viewer('owner-1')),
      ).toBe('SUSPENDED');
    });

    it('keeps real values for ADMIN and SUPERADMIN viewers — the admin search UI reads them', () => {
      expect(
        resolver.role(row({ role: 'MODERATOR' }), viewer('adm', 'ADMIN')),
      ).toBe('MODERATOR');
      expect(
        resolver.status(row({ status: 'BANNED' }), viewer('sa', 'SUPERADMIN')),
      ).toBe('BANNED');
    });

    it('does NOT privilege MODERATOR viewers — no admin surface gates on that role', () => {
      expect(
        resolver.role(row({ role: 'ADMIN' }), viewer('mod', 'MODERATOR')),
      ).toBe('USER');
    });

    it('passes real values through on viewer-less (public auth-mutation) surfaces, where the row is the caller own', () => {
      expect(resolver.status(row({ status: 'PENDING_VERIFICATION' }), undefined)).toBe(
        'PENDING_VERIFICATION',
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
