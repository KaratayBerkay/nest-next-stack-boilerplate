import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service: DeviceService;

  const mockPrisma = {
    device: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      // enforceDeviceLimit's dependencies — every resolveForLogin call runs
      // it. Defaulted low so it's a no-op unless a test explicitly exercises
      // eviction, matching the real ConfigService default it's compared
      // against below.
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn(),
    },
  };

  const mockConfig = {
    // Real ConfigService.get(key, default) returns `default` for an unset
    // key — this mock previously always returned `undefined` regardless of
    // the caller's default, which silently broke any code (like
    // enforceDeviceLimit's MAX_DEVICES_PER_USER lookup) relying on that.
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'NODE_ENV') return 'development';
      return defaultValue;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'ENCRYPTION_KEY')
        return 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
      throw new Error(`Missing ${key}`);
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        CryptoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handshake', () => {
    it('echoes presented cookie token', () => {
      const req = {
        headers: {},
        cookies: { device_token: 'existing-token' },
      };
      const result = service.handshake({ req } as never);
      expect(result.deviceToken).toBe('existing-token');
    });

    it('echoes presented x-device-token header', () => {
      const req = {
        headers: { 'x-device-token': 'header-token' },
        cookies: {},
      };
      const result = service.handshake({ req } as never);
      expect(result.deviceToken).toBe('header-token');
    });

    it('mints a new token when no cookie or header is present', () => {
      const req = {
        headers: {},
        cookies: {},
        res: { cookie: jest.fn() },
      };
      const result = service.handshake({ req } as never);
      expect(result.deviceToken).toBeDefined();
      expect(result.deviceToken.length).toBeGreaterThan(0);
    });
  });

  describe('resolveForLogin', () => {
    const userId = 'user-1';
    const ownDevice = {
      id: 'dev-1',
      userId,
      token: 'own-token',
      type: 'WEB',
      fingerprint: null,
      ip: null,
      lastSeenAt: new Date(),
    };
    const foreignDevice = {
      id: 'dev-2',
      userId: 'user-2',
      token: 'foreign-token',
      type: 'WEB',
      fingerprint: null,
      ip: null,
      lastSeenAt: new Date(),
    };

    it('reuses own token without rotation', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(ownDevice);
      mockPrisma.device.update.mockResolvedValue({
        ...ownDevice,
        lastSeenAt: new Date(),
      });

      const req = {
        headers: {},
        cookies: { device_token: 'own-token' },
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      const result = await service.resolveForLogin(userId, { req } as never);

      expect(result.deviceToken).toBe('own-token');
      expect(result.changed).toBe(false);
      expect(mockPrisma.device.update).toHaveBeenCalled();
      expect(mockPrisma.device.create).not.toHaveBeenCalled();
    });

    it('creates Device row with presented landing token', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(null);
      mockPrisma.device.create.mockResolvedValue({
        id: 'dev-new',
        userId,
        token: 'landing-token',
        type: 'WEB',
        fingerprint: null,
        ip: null,
        lastSeenAt: new Date(),
      });

      const req = {
        headers: {},
        cookies: { device_token: 'landing-token' },
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      const result = await service.resolveForLogin(userId, { req } as never);

      expect(result.deviceToken).toBe('landing-token');
      expect(result.changed).toBe(true);
      expect(mockPrisma.device.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ token: 'landing-token', userId }),
        }),
      );
    });

    it('mints a fresh token for a foreign user token', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(foreignDevice);
      mockPrisma.device.create.mockResolvedValue({
        id: 'dev-new',
        userId,
        token: 'fresh-token',
        type: 'WEB',
        fingerprint: null,
        ip: null,
        lastSeenAt: new Date(),
      });

      const req = {
        headers: {},
        cookies: { device_token: 'foreign-token' },
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      const result = await service.resolveForLogin(userId, { req } as never);

      expect(result.deviceToken).not.toBe('foreign-token');
      expect(result.changed).toBe(true);
      expect(mockPrisma.device.create).toHaveBeenCalled();
    });

    it('mints a fresh token when no cookie is present', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(null);
      mockPrisma.device.create.mockResolvedValue({
        id: 'dev-new',
        userId,
        token: 'fresh-token',
        type: 'WEB',
        fingerprint: null,
        ip: null,
        lastSeenAt: new Date(),
      });

      const req = {
        headers: {},
        cookies: {},
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      const result = await service.resolveForLogin(userId, { req } as never);

      expect(result.deviceToken).toBeDefined();
      expect(result.changed).toBe(true);
      expect(mockPrisma.device.create).toHaveBeenCalled();
    });

    it('evicts the oldest devices once the per-user limit is exceeded', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(null);
      mockPrisma.device.create.mockResolvedValue({
        id: 'dev-new',
        userId,
        token: 'fresh-token',
        type: 'WEB',
        fingerprint: null,
        ip: null,
        lastSeenAt: new Date(),
      });
      mockPrisma.device.count.mockResolvedValue(12);
      mockPrisma.device.findMany.mockResolvedValue([
        { id: 'oldest-1', type: 'WEB' },
        { id: 'oldest-2', type: 'MOBILE' },
      ]);

      const req = {
        headers: {},
        cookies: {},
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      await service.resolveForLogin(userId, { req } as never);

      // 12 devices, default MAX_DEVICES_PER_USER of 10 -> 2 oldest evicted.
      expect(mockPrisma.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 2 }),
      );
      expect(mockPrisma.device.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['oldest-1', 'oldest-2'] } },
      });
    });

    it('does not evict anything when at or under the per-user limit', async () => {
      mockPrisma.device.findUnique.mockResolvedValue(null);
      mockPrisma.device.create.mockResolvedValue({
        id: 'dev-new',
        userId,
        token: 'fresh-token',
        type: 'WEB',
        fingerprint: null,
        ip: null,
        lastSeenAt: new Date(),
      });
      mockPrisma.device.count.mockResolvedValue(10);

      const req = {
        headers: {},
        cookies: {},
        ip: '127.0.0.1',
        res: { cookie: jest.fn() },
      };
      await service.resolveForLogin(userId, { req } as never);

      expect(mockPrisma.device.deleteMany).not.toHaveBeenCalled();
    });
  });
});
