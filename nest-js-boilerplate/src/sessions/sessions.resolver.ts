import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TokenStoreService } from '../auth/token-store.service';

@ObjectType()
class SessionInfo {
  @Field(() => ID)
  sessionId!: string;

  @Field()
  deviceId!: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  issuedAt?: string;
}

@UseGuards(SessionAuthGuard)
@Resolver()
export class SessionsResolver {
  constructor(private readonly tokenStore: TokenStoreService) {}

  @Query(() => [SessionInfo])
  async mySessions(@CurrentUser() user: JwtUser) {
    const entries = await this.tokenStore.listSessionsWithKeys(user.userId);
    return entries.map(({ session }) => ({
      sessionId: session.sessionId,
      deviceId: session.deviceId ?? '',
      ip: session.ip ?? undefined,
      userAgent: session.userAgent ?? undefined,
      issuedAt: session.issuedAt ?? undefined,
    }));
  }

  @Mutation(() => Boolean)
  async revokeSession(
    @CurrentUser() user: JwtUser,
    @Args('sessionId', { type: () => ID }) sessionId: string,
  ) {
    return this.tokenStore.revokeSessionBySessionId(user.userId, sessionId);
  }

  @Mutation(() => Boolean)
  async revokeAllOtherSessions(@CurrentUser() user: JwtUser) {
    const entries = await this.tokenStore.listSessionsWithKeys(user.userId);
    const toRevoke = entries.filter(
      (e) => e.session.sessionId !== user.sessionId,
    );
    if (toRevoke.length === 0) return false;
    await Promise.all(toRevoke.map((e) => this.tokenStore.revoke(e.key)));
    return true;
  }
}
