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
    },
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      return undefined;
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
  });
});
