import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { ApiKeysService, type ApiKeyData } from './api-keys.service';
import { ApiKeyGuard } from './api-keys.guard';
import { ApiKeyType, ApiKeyCreateResult } from './api-keys.types';

@UseGuards(SessionAuthGuard, ApiKeyGuard)
@Resolver()
export class ApiKeysResolver {
  constructor(private readonly apiKeys: ApiKeysService) {}

  @Query(() => [ApiKeyType])
  async myApiKeys(@CurrentUser() user: JwtUser): Promise<ApiKeyData[]> {
    return this.apiKeys.listForUser(user.userId);
  }

  @Mutation(() => ApiKeyCreateResult)
  async createApiKey(
    @CurrentUser() user: JwtUser,
    @Args('name') name: string,
    @Args('expiresInDays', { nullable: true }) expiresInDays?: number,
  ) {
    return this.apiKeys.generate(user.userId, name, {
      role: user.role,
      tier: user.tier,
      expiresInDays,
    });
  }

  @Mutation(() => Boolean)
  async revokeApiKey(
    @CurrentUser() user: JwtUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.apiKeys.revoke(id, user.userId);
    return true;
  }

  @Mutation(() => ApiKeyType)
  async updateApiKey(
    @CurrentUser() user: JwtUser,
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('enabled', { nullable: true }) enabled?: boolean,
  ): Promise<ApiKeyData> {
    return this.apiKeys.update(id, user.userId, { name, enabled });
  }
}
