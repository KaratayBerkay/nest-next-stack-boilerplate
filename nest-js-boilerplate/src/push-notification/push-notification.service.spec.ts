import * as webPush from 'web-push';
import { PushNotificationService } from './push-notification.service';

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

const mockedSetVapidDetails = webPush.setVapidDetails as jest.Mock;
const mockedSendNotification = webPush.sendNotification as jest.Mock;

interface MockPrisma {
  pushSubscription: {
    findMany: jest.Mock;
    delete: jest.Mock;
  };
}

function mockPrisma(): MockPrisma {
  return {
    pushSubscription: { findMany: jest.fn(), delete: jest.fn() },
  };
}

function mockConfig(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string, def?: string) => values[key] ?? def),
  };
}

describe('PushNotificationService', () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = mockPrisma();
  });

  describe('constructor', () => {
    it('configures VAPID details when both keys are present', () => {
      const config = mockConfig({
        VAPID_PUBLIC_KEY: 'pub-key',
        VAPID_PRIVATE_KEY: 'priv-key',
        VAPID_SUBJECT: 'mailto:ops@example.com',
      });

      new PushNotificationService(prisma as never, config as never);

      expect(mockedSetVapidDetails).toHaveBeenCalledWith(
        'mailto:ops@example.com',
        'pub-key',
        'priv-key',
      );
    });

    it('skips VAPID setup when keys are missing (dev without push configured)', () => {
      const config = mockConfig({});

      new PushNotificationService(prisma as never, config as never);

      expect(mockedSetVapidDetails).not.toHaveBeenCalled();
    });
  });

  describe('sendToUser', () => {
    function buildService() {
      return new PushNotificationService(
        prisma as never,
        mockConfig({
          VAPID_PUBLIC_KEY: 'pub-key',
          VAPID_PRIVATE_KEY: 'priv-key',
        }) as never,
      );
    }

    it('sends to every subscription and reports zero failures on the happy path', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([
        { id: 's1', endpoint: 'https://a', p256dh: 'p1', auth: 'a1' },
        { id: 's2', endpoint: 'https://b', p256dh: 'p2', auth: 'a2' },
      ]);
      mockedSendNotification.mockResolvedValue(undefined);
      const service = buildService();

      const result = await service.sendToUser('u1', 'Hello', 'World');

      expect(result).toEqual({ sent: 2, failed: 0 });
      expect(mockedSendNotification).toHaveBeenCalledTimes(2);
      expect(mockedSendNotification).toHaveBeenCalledWith(
        { endpoint: 'https://a', keys: { p256dh: 'p1', auth: 'a1' } },
        JSON.stringify({
          title: 'Hello',
          body: 'World',
          icon: undefined,
          data: undefined,
        }),
      );
      expect(prisma.pushSubscription.delete).not.toHaveBeenCalled();
    });

    it('returns sent: 0, failed: 0 when the user has no subscriptions', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([]);
      const service = buildService();

      const result = await service.sendToUser('u1', 'Hello');

      expect(result).toEqual({ sent: 0, failed: 0 });
      expect(mockedSendNotification).not.toHaveBeenCalled();
    });

    it('removes the subscription and counts a failure when the push endpoint is gone (410)', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([
        {
          id: 'expired-sub',
          endpoint: 'https://dead',
          p256dh: 'p1',
          auth: 'a1',
        },
      ]);
      const goneError: { statusCode: number } = { statusCode: 410 };
      mockedSendNotification.mockRejectedValue(goneError);
      const service = buildService();

      const result = await service.sendToUser('u1', 'Hello');

      expect(result).toEqual({ sent: 0, failed: 1 });
      expect(prisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { id: 'expired-sub' },
      });
    });

    it('keeps the subscription and counts a failure on a transient (non-410/404) error', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([
        {
          id: 'flaky-sub',
          endpoint: 'https://flaky',
          p256dh: 'p1',
          auth: 'a1',
        },
      ]);
      const serverError: { statusCode: number } = { statusCode: 500 };
      mockedSendNotification.mockRejectedValue(serverError);
      const service = buildService();

      const result = await service.sendToUser('u1', 'Hello');

      expect(result).toEqual({ sent: 0, failed: 1 });
      expect(prisma.pushSubscription.delete).not.toHaveBeenCalled();
    });

    it('tallies mixed success and failure across multiple subscriptions', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([
        { id: 'ok-sub', endpoint: 'https://ok', p256dh: 'p1', auth: 'a1' },
        { id: 'dead-sub', endpoint: 'https://dead', p256dh: 'p2', auth: 'a2' },
      ]);
      mockedSendNotification.mockImplementation((sub: { endpoint: string }) => {
        if (sub.endpoint === 'https://dead') {
          return Promise.reject(
            Object.assign(new Error('Gone'), { statusCode: 404 }),
          );
        }
        return Promise.resolve(undefined);
      });
      const service = buildService();

      const result = await service.sendToUser('u1', 'Hello');

      expect(result).toEqual({ sent: 1, failed: 1 });
      expect(prisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { id: 'dead-sub' },
      });
    });
  });
});
