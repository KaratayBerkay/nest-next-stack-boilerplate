import { ConflictException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { TokenStoreService } from '../auth/token-store.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileInput } from './dto/update-profile.input';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
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
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
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

    const user = await this.prisma.user.update({ where: { id: userId }, data });

    const redisFields: Record<string, string> = {};
    if (input.name !== undefined) redisFields.name = input.name;
    if (input.username !== undefined)
      redisFields.username = user.username ?? '';
    if (input.avatarUrl !== undefined) redisFields.avatarUrl = input.avatarUrl;
    if (input.locale !== undefined) redisFields.locale = input.locale;
    if (input.timezone !== undefined) redisFields.timezone = input.timezone;
    if (Object.keys(redisFields).length > 0) {
      await this.tokenStore.rewriteFieldsForUser(userId, redisFields);
    }

    return user;
  }
}
