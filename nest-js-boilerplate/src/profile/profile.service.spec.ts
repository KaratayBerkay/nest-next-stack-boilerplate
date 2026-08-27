import { Prisma } from '@prisma/client';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockPrisma: { user: { findUnique: jest.Mock; update: jest.Mock } };
  let mockTokenStore: { rewriteFieldsForUser: jest.Mock };
  let mockCache: { invalidate: jest.Mock };

  beforeEach(() => {
    mockPrisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
    mockTokenStore = { rewriteFieldsForUser: jest.fn() };
    mockCache = { invalidate: jest.fn().mockResolvedValue(undefined) };
    service = new ProfileService(
      mockPrisma as never,
      mockTokenStore as never,
      mockCache as never,
    );
  });

  describe('updateProfile', () => {
    it('only touches provided fields', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', username: 'alice' });
      await service.updateProfile('u1', { name: 'Alice' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { name: 'Alice' },
      });
    });

    it('throws a structured exception when the username is taken by someone else', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'other-user',
        username: 'bob',
      });
      await expect(
        service.updateProfile('u1', { username: 'bob' }),
      ).rejects.toMatchObject({
        response: { exc: 'EX_PROFILE_USERNAME_TAKEN' },
      });
    });

    it("allows resubmitting the caller's own current username", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        username: 'alice',
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', username: 'alice' });
      await expect(
        service.updateProfile('u1', { username: 'alice' }),
      ).resolves.toBeDefined();
    });

    it('syncs name to Redis via rewriteFieldsForUser', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', username: 'alice' });
      await service.updateProfile('u1', { name: 'Alice' });
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        name: 'Alice',
      });
    });

    it('does not call rewriteFieldsForUser when no snapshot fields change', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1' });
      await service.updateProfile('u1', { bio: 'hello' });
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
    });

    it('maps a race-lost unique-constraint violation on username to the same friendly conflict — regression: the findUnique pre-check is a TOCTOU race (the DB @unique constraint is what actually prevents the collision), and previously the resulting P2002 from user.update was never caught, surfacing as a raw 500 instead of EX_PROFILE_USERNAME_TAKEN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      await expect(
        service.updateProfile('u1', { username: 'racedname' }),
      ).rejects.toMatchObject({
        response: { exc: 'EX_PROFILE_USERNAME_TAKEN' },
      });
    });

    it('still returns the updated user when the Redis session fan-out fails — a committed profile update must not be reported to the caller as a failure', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', username: 'alice' });
      mockTokenStore.rewriteFieldsForUser.mockRejectedValue(
        new Error('ECONNRESET'),
      );

      await expect(
        service.updateProfile('u1', { name: 'Alice' }),
      ).resolves.toEqual({ id: 'u1', username: 'alice' });
    });
  });

  describe('isUsernameAvailable', () => {
    it("returns true for the caller's own current username", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        username: 'alice',
      });
      await expect(service.isUsernameAvailable('alice', 'u1')).resolves.toBe(
        true,
      );
    });

    it('returns false when another user already has it', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'other',
        username: 'alice',
      });
      await expect(service.isUsernameAvailable('alice', 'u1')).resolves.toBe(
        false,
      );
    });

    it('returns false for too-short usernames without querying the DB', async () => {
      await expect(service.isUsernameAvailable('ab', 'u1')).resolves.toBe(
        false,
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('returns false for usernames with invalid characters', async () => {
      await expect(service.isUsernameAvailable('alice!', 'u1')).resolves.toBe(
        false,
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
