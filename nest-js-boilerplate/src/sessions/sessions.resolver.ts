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
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

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

  @Field({ nullable: true })
  trusted?: boolean;
}

@UseGuards(SessionAuthGuard)
@Resolver()
export class SessionsResolver {
  constructor(
    private readonly tokenStore: TokenStoreService,
    private readonly prisma: PrismaService,
    private readonly gateway: RealtimeGateway,
  ) {}

  @Query(() => [SessionInfo])
  async mySessions(@CurrentUser() user: JwtUser) {
    const entries = await this.tokenStore.listSessionsWithKeys(user.userId);

    const deviceIds = entries
      .map((e) => e.session.deviceId)
      .filter((id): id is string => !!id);
    const devices = deviceIds.length
      ? await this.prisma.device.findMany({
          where: { id: { in: deviceIds } },
          select: { id: true, trusted: true },
        })
      : [];
    const trustedMap = new Map(
      devices.map((d) => [d.id, d.trusted]),
    );

    return entries.map(({ session }) => ({
      sessionId: session.sessionId,
      deviceId: session.deviceId ?? '',
      ip: session.ip ?? undefined,
      userAgent: session.userAgent ?? undefined,
      issuedAt: session.issuedAt ?? undefined,
      trusted:
        session.deviceId
          ? trustedMap.get(session.deviceId) ?? false
          : undefined,
    }));
  }

  @Mutation(() => Boolean)
  async revokeSession(
    @CurrentUser() user: JwtUser,
    @Args('sessionId', { type: () => ID }) sessionId: string,
  ) {
    const revoked = await this.tokenStore.revokeSessionBySessionId(
      user.userId,
      sessionId,
    );
    if (revoked) {
      // Also close any live WebSocket connections belonging to this session
      this.gateway.closeSocketsForSession(user.userId, sessionId);
    }
    return revoked;
  }

  @Mutation(() => Boolean)
  async revokeAllOtherSessions(@CurrentUser() user: JwtUser) {
    const entries = await this.tokenStore.listSessionsWithKeys(user.userId);
    const toRevoke = entries.filter(
      (e) => e.session.sessionId !== user.sessionId,
    );
    if (toRevoke.length === 0) return false;
    await Promise.all(toRevoke.map((e) => this.tokenStore.revoke(e.key)));
    // Close WebSocket connections for all revoked sessions
    for (const { session } of toRevoke) {
      this.gateway.closeSocketsForSession(user.userId, session.sessionId);
    }
    return true;
  }

  @Mutation(() => Boolean)
  async trustCurrentDevice(@CurrentUser() user: JwtUser) {
    const entries = await this.tokenStore.listSessionsWithKeys(
      user.userId,
    );
    const current = entries.find(
      (e) => e.session.sessionId === user.sessionId,
    );
    if (!current?.session.deviceId) return false;

    await this.prisma.device.update({
      where: { id: current.session.deviceId },
      data: { trusted: true },
    });

    return true;
  }
}
