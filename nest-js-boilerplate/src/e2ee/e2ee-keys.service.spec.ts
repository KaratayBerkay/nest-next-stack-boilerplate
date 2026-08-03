import { ConfigService } from '@nestjs/config';
import type { Redis } from 'ioredis';
import { E2eeKeysService } from './e2ee-keys.service';

function createRedisMock() {
  const strings = new Map<string, string>();
  const lists = new Map<string, string[]>();

  return {
    get: jest.fn((key: string) => Promise.resolve(strings.get(key) ?? null)),
    set: jest.fn((key: string, value: string, ..._args: string[]) => {
      strings.set(key, value);
      return Promise.resolve('OK');
    }),
    exists: jest.fn((key: string) =>
      Promise.resolve(strings.has(key) || lists.has(key) ? 1 : 0),
    ),
    del: jest.fn((key: string) => {
      const existed = strings.has(key) || lists.has(key);
      strings.delete(key);
      lists.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    lpop: jest.fn((key: string) => {
      const arr = lists.get(key);
      if (!arr || arr.length === 0) return Promise.resolve(null);
      const first = arr.shift()!;
      if (arr.length === 0) lists.delete(key);
      return Promise.resolve(first);
    }),
    rpush: jest.fn((key: string, value: string) => {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key)!.push(value);
      return Promise.resolve(lists.get(key)!.length);
    }),
    expire: jest.fn(() => Promise.resolve(1)),
    multi: jest.fn(() => {
      const ops: Array<() => void> = [];
      return {
        set: (key: string, value: string, ..._args: string[]) => {
          ops.push(() => strings.set(key, value));
        },
        del: (key: string) =>
          ops.push(() => {
            strings.delete(key);
            lists.delete(key);
          }),
        rpush: (key: string, value: string) =>
          ops.push(() => {
            if (!lists.has(key)) lists.set(key, []);
            lists.get(key)!.push(value);
          }),
        expire: (_key: string) => ops.push(() => {}),
        exec: () => {
          ops.forEach((fn) => fn());
          return Promise.resolve([]);
        },
      };
    }),
    _strings: strings,
    _lists: lists,
  };
}

const stubConfig = (overrides: Record<string, string> = {}): ConfigService =>
  ({
    get: (key: string, defaultValue?: string) =>
      overrides[key] ?? defaultValue ?? null,
  }) as unknown as ConfigService;

describe('E2eeKeysService', () => {
  let service: E2eeKeysService;
  let redis: ReturnType<typeof createRedisMock>;

  beforeEach(() => {
    redis = createRedisMock();
    service = new E2eeKeysService(
      redis as unknown as Redis,
      stubConfig({ SESSION_TTL: '900s' }),
    );
  });

  // ── OPK race condition: concurrent claims consume exactly one OPK each ──
  describe('OPK race condition', () => {
    it('should atomically consume one OPK per claimBundle call', async () => {
      const userId = 'user-1';
      const deviceId = 'device-1';

      // Register a bundle with 2 OPKs
      await service.registerBundle(userId, deviceId, { spk: 'key' }, [
        { keyId: 'opk-1', publicKey: 'pub-1' },
        { keyId: 'opk-2', publicKey: 'pub-2' },
      ]);

      // First claim should consume opk-1
      const claim1 = await service.claimBundle(userId);
      expect(claim1).not.toBeNull();
      expect(claim1!.oneTimePrekey).toEqual({
        keyId: 'opk-1',
        publicKey: 'pub-1',
      });

      // Second claim should consume opk-2
      const claim2 = await service.claimBundle(userId);
      expect(claim2).not.toBeNull();
      expect(claim2!.oneTimePrekey).toEqual({
        keyId: 'opk-2',
        publicKey: 'pub-2',
      });

      // Third claim should have no OPK
      const claim3 = await service.claimBundle(userId);
      expect(claim3).not.toBeNull();
      expect(claim3!.oneTimePrekey).toBeUndefined();
    });

    it('should return null when user has no registered bundle', async () => {
      const result = await service.claimBundle('nonexistent-user');
      expect(result).toBeNull();
    });

    it('should allow multiple concurrent claims without double-consuming', async () => {
      const userId = 'user-2';
      const deviceId = 'device-2';

      // Register with 1 OPK
      await service.registerBundle(userId, deviceId, { spk: 'key' }, [
        { keyId: 'opk-single', publicKey: 'pub-single' },
      ]);

      // Simulate concurrent claims
      const [claim1, claim2] = await Promise.all([
        service.claimBundle(userId),
        service.claimBundle(userId),
      ]);

      // Exactly one should have gotten the OPK
      const opks = [claim1?.oneTimePrekey, claim2?.oneTimePrekey].filter(
        Boolean,
      );
      expect(opks).toHaveLength(1);
      expect(opks[0]).toEqual({ keyId: 'opk-single', publicKey: 'pub-single' });
    });
  });

  // ── Logout cleanup ─────────────────────────────────────────────────────
  describe('logout cleanup', () => {
    it('deleteForSession should remove bundle + OPK + active-device', async () => {
      const userId = 'user-3';
      const deviceId = 'device-3';

      await service.registerBundle(userId, deviceId, { spk: 'key' }, [
        { keyId: 'opk-1', publicKey: 'pub-1' },
      ]);

      // Verify data exists
      const before = await service.getBundleStatus(userId);
      expect(before.registered).toBe(true);

      await service.deleteForSession(userId, deviceId);

      // All keys should be gone
      const after = await service.getBundleStatus(userId);
      expect(after.registered).toBe(false);

      // Verify internal keys are deleted
      expect(redis._strings.has(`e2ee:bundle:${deviceId}`)).toBe(false);
      expect(redis._strings.has(`e2ee:active-device:${userId}`)).toBe(false);
    });

    it('deleteForSession should not delete if deviceId does not match active', async () => {
      const userId = 'user-4';
      const deviceId = 'device-4';
      const wrongDeviceId = 'device-wrong';

      await service.registerBundle(userId, deviceId, { spk: 'key' });

      // Try deleting with wrong device ID — should be no-op
      await service.deleteForSession(userId, wrongDeviceId);

      const after = await service.getBundleStatus(userId);
      expect(after.registered).toBe(true);
    });

    it('deleteForSession should no-op when deviceId is null', async () => {
      await service.deleteForSession('user-noop', null);
      // Should not throw
    });

    it('deleteForUser should remove all keys for the user', async () => {
      const userId = 'user-5';
      const deviceId = 'device-5';

      await service.registerBundle(userId, deviceId, { spk: 'key' }, [
        { keyId: 'opk-1', publicKey: 'pub-1' },
        { keyId: 'opk-2', publicKey: 'pub-2' },
      ]);

      await service.deleteForUser(userId);

      expect(redis._strings.has(`e2ee:bundle:${deviceId}`)).toBe(false);
      expect(redis._lists.has(`e2ee:otpk:${deviceId}`)).toBe(false);
      expect(redis._strings.has(`e2ee:active-device:${userId}`)).toBe(false);
    });

    it('deleteForUser should no-op when user has no active device', async () => {
      await service.deleteForUser('nonexistent-user');
      // Should not throw
    });
  });

  // ── Supersession ───────────────────────────────────────────────────────
  describe('supersession', () => {
    it('should supersede old device bundle when new device registers', async () => {
      const userId = 'user-6';

      await service.registerBundle(userId, 'old-device', { spk: 'old' });
      const result = await service.registerBundle(userId, 'new-device', {
        spk: 'new',
      });

      expect(result.superseded).toBe(true);

      // Old device should be gone
      const oldStatus = await redis.get(`e2ee:bundle:old-device`);
      expect(oldStatus).toBeNull();

      // New device should be active
      const status = await service.getBundleStatus(userId);
      expect(status.registered).toBe(true);
      expect(status.deviceId).toBe('new-device');
    });
  });

  // ── TTL refresh ────────────────────────────────────────────────────────
  describe('touchTTL', () => {
    it('should refresh TTL on all keys when bundle exists', async () => {
      const userId = 'user-7';
      const deviceId = 'device-7';

      await service.registerBundle(userId, deviceId, { spk: 'key' });
      await service.touchTTL(userId, deviceId);

      // Bundle should still exist and be registered after touch
      const status = await service.getBundleStatus(userId);
      expect(status.registered).toBe(true);
      expect(status.deviceId).toBe(deviceId);
    });

    it('should no-op when bundle does not exist', async () => {
      await service.touchTTL('no-user', 'no-device');
      // Should not throw
    });
  });
});
