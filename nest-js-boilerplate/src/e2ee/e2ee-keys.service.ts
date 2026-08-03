import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { parseDurationToSeconds } from '../common/utils/parse-duration';
import { REDIS_CLIENT } from '../redis/redis.tokens';
import type { E2eeLifecycleHook } from './e2ee-lifecycle.tokens';

const BUNDLE_PREFIX = 'e2ee:bundle:';
const OTPK_PREFIX = 'e2ee:otpk:';
const ACTIVE_PREFIX = 'e2ee:active-device:';

@Injectable()
export class E2eeKeysService implements E2eeLifecycleHook {
  private readonly ttl: number;
  private readonly logger = new Logger(E2eeKeysService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('SESSION_TTL', '900s');
    this.ttl = parseDurationToSeconds(raw);
  }

  private bundleKey(deviceId: string) {
    return `${BUNDLE_PREFIX}${deviceId}`;
  }

  private otpkKey(deviceId: string) {
    return `${OTPK_PREFIX}${deviceId}`;
  }

  private activeKey(userId: string) {
    return `${ACTIVE_PREFIX}${userId}`;
  }

  async registerBundle(
    userId: string,
    deviceId: string,
    bundle: Record<string, unknown>,
    oneTimePrekeys?: Array<{ keyId: string; publicKey: string }>,
  ): Promise<{ deviceId: string; superseded: boolean }> {
    const activeDevice = await this.redis.get(this.activeKey(userId));
    const superseded = !!activeDevice && activeDevice !== deviceId;

    const pipe = this.redis.multi();

    if (superseded && activeDevice) {
      pipe.del(this.bundleKey(activeDevice));
      pipe.del(this.otpkKey(activeDevice));
    }

    pipe.set(
      this.bundleKey(deviceId),
      JSON.stringify({ ...bundle, userId }),
      'EX',
      this.ttl,
    );
    pipe.set(this.activeKey(userId), deviceId, 'EX', this.ttl);

    if (oneTimePrekeys && oneTimePrekeys.length > 0) {
      for (const opk of oneTimePrekeys) {
        pipe.rpush(this.otpkKey(deviceId), JSON.stringify(opk));
      }
      pipe.expire(this.otpkKey(deviceId), this.ttl);
    }

    await pipe.exec();
    this.logger.debug(
      `registerBundle userId=${userId} deviceId=${deviceId} superseded=${superseded}`,
    );
    return { deviceId, superseded };
  }

  async claimBundle(targetUserId: string): Promise<{
    deviceId: string;
    bundle: Record<string, unknown>;
    oneTimePrekey?: { keyId: string; publicKey: string };
  } | null> {
    const deviceId = await this.redis.get(this.activeKey(targetUserId));
    if (!deviceId) return null;

    const bundleRaw = await this.redis.get(this.bundleKey(deviceId));
    if (!bundleRaw) return null;

    const opkRaw = await this.redis.lpop(this.otpkKey(deviceId));

    return {
      deviceId,
      bundle: JSON.parse(bundleRaw),
      oneTimePrekey: opkRaw ? JSON.parse(opkRaw) : undefined,
    };
  }

  async getBundleStatus(
    userId: string,
  ): Promise<{ registered: boolean; deviceId?: string }> {
    const deviceId = await this.redis.get(this.activeKey(userId));
    if (!deviceId) return { registered: false };
    const exists = await this.redis.exists(this.bundleKey(deviceId));
    return { registered: exists === 1, deviceId };
  }

  async replenishPrekeys(
    userId: string,
    oneTimePrekeys: Array<{ keyId: string; publicKey: string }>,
  ): Promise<number> {
    const deviceId = await this.redis.get(this.activeKey(userId));
    if (!deviceId) return 0;

    const pipe = this.redis.multi();
    for (const opk of oneTimePrekeys) {
      pipe.rpush(this.otpkKey(deviceId), JSON.stringify(opk));
    }
    pipe.expire(this.otpkKey(deviceId), this.ttl);
    await pipe.exec();
    return oneTimePrekeys.length;
  }

  async touchTTL(userId: string, deviceId: string | null): Promise<void> {
    if (!deviceId) return;
    const exists = await this.redis.exists(this.bundleKey(deviceId));
    if (!exists) return;

    const pipe = this.redis.multi();
    pipe.expire(this.bundleKey(deviceId), this.ttl);
    pipe.expire(this.otpkKey(deviceId), this.ttl);
    pipe.expire(this.activeKey(userId), this.ttl);
    await pipe.exec();
  }

  async deleteForSession(
    userId: string,
    deviceId: string | null,
  ): Promise<void> {
    if (!deviceId) return;
    const active = await this.redis.get(this.activeKey(userId));
    if (active !== deviceId) return;

    const pipe = this.redis.multi();
    pipe.del(this.bundleKey(deviceId));
    pipe.del(this.otpkKey(deviceId));
    pipe.del(this.activeKey(userId));
    await pipe.exec();
    this.logger.debug(`deleteForSession userId=${userId} deviceId=${deviceId}`);
  }

  async deleteForUser(userId: string): Promise<void> {
    const deviceId = await this.redis.get(this.activeKey(userId));
    if (!deviceId) return;

    const pipe = this.redis.multi();
    pipe.del(this.bundleKey(deviceId));
    pipe.del(this.otpkKey(deviceId));
    pipe.del(this.activeKey(userId));
    await pipe.exec();
    this.logger.debug(`deleteForUser userId=${userId} deviceId=${deviceId}`);
  }

  async getIdentityKey(userId: string): Promise<{
    identitySigningKey: string;
    identityAgreementKey: string;
  } | null> {
    const deviceId = await this.redis.get(this.activeKey(userId));
    if (!deviceId) return null;

    const bundleRaw = await this.redis.get(this.bundleKey(deviceId));
    if (!bundleRaw) return null;

    const bundle = JSON.parse(bundleRaw) as {
      identitySigningKey?: string;
      identityAgreementKey?: string;
    };
    if (!bundle.identitySigningKey || !bundle.identityAgreementKey) {
      return null;
    }

    return {
      identitySigningKey: bundle.identitySigningKey,
      identityAgreementKey: bundle.identityAgreementKey,
    };
  }

  async wipeDevice(
    userId: string,
    deviceId: string,
  ): Promise<{ wiped: boolean }> {
    const active = await this.redis.get(this.activeKey(userId));
    if (active !== deviceId) return { wiped: false };

    const pipe = this.redis.multi();
    pipe.del(this.bundleKey(deviceId));
    pipe.del(this.otpkKey(deviceId));
    pipe.del(this.activeKey(userId));
    await pipe.exec();
    this.logger.debug(`wipeDevice userId=${userId} deviceId=${deviceId}`);
    return { wiped: true };
  }
}
