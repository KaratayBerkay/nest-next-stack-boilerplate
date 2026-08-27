import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenStoreService } from '../auth/token-store.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileInput } from './dto/update-profile.input';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly cache: CacheAsideService,
  ) {}

  async isUsernameAvailable(
    username: string,
    currentUserId: string,
  ): Promise<boolean> {
    const normalized = username.toLowerCase();
    if (normalized.length < 3 || normalized.length > 30) return false;
    if (!/^[a-z0-9_]+$/.test(normalized)) return false;
    const existing = await this.prisma.user.findUnique({
      where: { username: normalized },
    });
    return !existing || existing.id === currentUserId;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.bio !== undefined) data.bio = input.bio;
    if (input.chatNickname !== undefined)
      data.chatNickname = input.chatNickname;
    if (input.useNickname !== undefined) data.useNickname = input.useNickname;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.hideAvatar !== undefined) data.hideAvatar = input.hideAvatar;
    if (input.locale !== undefined) data.locale = input.locale;
    if (input.timezone !== undefined) data.timezone = input.timezone;

    if (input.username !== undefined) {
      const username = input.username.toLowerCase();
      const existing = await this.prisma.user.findUnique({
        where: { username },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException({
          exc: 'EX_PROFILE_USERNAME_TAKEN',
          msg: 'Username is already taken',
          key: 'settings.errors.usernameTaken',
          field: 'username',
        });
      }
      data.username = username;
    }

    let user;
    try {
      user = await this.prisma.user.update({ where: { id: userId }, data });
    } catch (err) {
      // The isUsernameAvailable-style check above is still a TOCTOU race —
      // the DB's own @unique constraint on username is what actually
      // prevents a collision, but without this catch a race loser got a raw
      // 500 instead of the same friendly conflict every other caller sees.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          exc: 'EX_PROFILE_USERNAME_TAKEN',
          msg: 'Username is already taken',
          key: 'settings.errors.usernameTaken',
          field: 'username',
        });
      }
      throw err;
    }

    // CacheAsideService catches and logs its own failures internally.
    void this.cache.invalidate(`cache:profile:${userId}`);

    const redisFields: Record<string, string> = {};
    if (input.name !== undefined) redisFields.name = input.name;
    if (input.chatNickname !== undefined)
      redisFields.chatNickname = input.chatNickname;
    if (input.useNickname !== undefined)
      redisFields.useNickname = input.useNickname ? '1' : '0';
    if (input.username !== undefined)
      redisFields.username = user.username ?? '';
    if (input.avatarUrl !== undefined) redisFields.avatarUrl = input.avatarUrl;
    if (input.hideAvatar !== undefined)
      redisFields.hideAvatar = input.hideAvatar ? '1' : '0';
    if (input.locale !== undefined) redisFields.locale = input.locale;
    if (input.timezone !== undefined) redisFields.timezone = input.timezone;
    if (Object.keys(redisFields).length > 0) {
      // The Postgres row is already the committed source of truth at this
      // point — this is a best-effort fan-out to refresh cached session
      // fields. A transient Redis hiccup here must not turn an already-
      // successful profile update into an error response (the client would
      // see a failure for a change that, on refresh, actually took effect).
      try {
        await this.tokenStore.rewriteFieldsForUser(userId, redisFields);
      } catch (err) {
        this.logger.error(
          `rewriteFieldsForUser failed after a committed profile update for userId=${userId} — active sessions may show stale profile fields until their next refresh: ${(err as Error).message}`,
        );
      }
    }

    return user;
  }
}
