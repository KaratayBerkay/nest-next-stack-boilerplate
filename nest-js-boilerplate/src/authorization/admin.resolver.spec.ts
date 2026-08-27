import { AdminResolver } from './admin.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MfaService } from '../mfa/mfa.service';
import { OutboxService } from '../outbox/outbox.service';
import type { JwtUser } from '../auth/auth.types';

describe('AdminResolver', () => {
  let resolver: AdminResolver;
  let mockPrisma: { user: { findMany: jest.Mock } };

  const admin: JwtUser = {
    userId: 'admin-1',
    sessionId: 'sess-1',
    email: 'admin@example.com',
    role: 'ADMIN',
    tier: 'FREE',
    unread: 0,
  };

  beforeEach(() => {
    mockPrisma = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };

    resolver = new AdminResolver(
      mockPrisma as unknown as PrismaService,
      {} as TokenStoreService,
      {} as RealtimeGateway,
      {} as MfaService,
      {} as OutboxService,
    );
  });

  describe('adminSearchUsers', () => {
    it('queries by search term with no status filter and only the admin excluded — unlike find-friends search', async () => {
      await resolver.adminSearchUsers(admin, 'bob');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          id: { not: 'admin-1' },
          OR: [
            { name: { contains: 'bob', mode: 'insensitive' } },
            { email: { contains: 'bob', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('omits the OR search clause entirely when no search term is given', async () => {
      await resolver.adminSearchUsers(admin, undefined);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { not: 'admin-1' } },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('finds a banned user by name or email', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'u2',
          name: 'Banned Bob',
          email: 'bob@example.com',
          status: 'BANNED',
        },
      ]);

      const result = await resolver.adminSearchUsers(admin, 'bob');

      expect(result).toEqual([
        {
          id: 'u2',
          name: 'Banned Bob',
          email: 'bob@example.com',
          status: 'BANNED',
        },
      ]);
    });

    it('falls back to email via displayName when name is null', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u3', name: null, email: 'noname@example.com' },
      ]);

      const result = await resolver.adminSearchUsers(admin);

      expect(result[0].name).toBe('noname@example.com');
    });
  });
});
