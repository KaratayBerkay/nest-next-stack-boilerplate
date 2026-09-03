import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import type { JwtUser, SessionUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TokenStoreService } from '../auth/token-store.service';
import { hashSessionId } from '../common/crypto/crypto.service';
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
  deviceType?: string;

  @Field({ nullable: true })
  trusted?: boolean;
}

interface DeviceEnrichment {
  id: string;
  trusted: boolean;
  type: string | null;
}

function mapSessionInfo(
  session: SessionUser,
  deviceMap: Map<string, DeviceEnrichment>,
) {
  const device = session.deviceId ? deviceMap.get(session.deviceId) : undefined;
  return {
    // Non-reversible fingerprint, not the raw sessionId — see hashSessionId's doc comment.
    // revokeSession()/TokenStoreService.revokeSessionBySessionId() match sessions by this
    // same hash, so the client never needs (or receives) the underlying bearer credential.
    sessionId: hashSessionId(session.sessionId),
    deviceId: session.deviceId ?? '',
    ip: session.ip ?? undefined,
    userAgent: session.userAgent ?? undefined,
    issuedAt: session.issuedAt ?? undefined,
    deviceType: device?.type ?? undefined,
    trusted: device?.trusted,
  };
}

@UseGuards(SessionAuthGuard)
@Resolver()
export class SessionsResolver {
  private readonly logger = new Logger(SessionsResolver.name);

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
    let devices: Array<{ id: string; trusted: boolean; type: string | null }> =
      [];
    if (deviceIds.length) {
      try {
        devices = await this.prisma.device.findMany({
          where: { id: { in: deviceIds } },
          select: { id: true, trusted: true, type: true },
        });
      } catch (err) {
        // Best-effort enrichment — a device lookup failure must never take
        // down the whole sessions list (F9).
        this.logger.warn(
          `device enrichment failed for user ${user.userId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    return entries.map(({ session }) => mapSessionInfo(session, deviceMap));
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

  /**
   * Marks the current session's device trusted, which makes future logins
   * from it skip MFA entirely — so it needs a step-up of its own. The only
   * proof accepted is the one-shot marker verifyLoginMfa's token issuance
   * leaves behind (TokenStoreService.markMfaFresh): this session passed the
   * second factor moments ago. Without it, any authenticated session —
   * including a hijacked one — could quietly entrench itself by trusting
   * its device behind nothing more than SessionAuthGuard.
   */
  @Mutation(() => Boolean)
  async trustCurrentDevice(@CurrentUser() user: JwtUser) {
    if (
      !user.sessionId ||
      !(await this.tokenStore.consumeMfaFresh(user.sessionId))
    ) {
      throw new ForbiddenException({
        exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED',
        msg: 'A device can only be trusted right after completing two-factor sign-in',
        key: 'auth.errors.mfaStepUpRequired',
      });
    }
    const entries = await this.tokenStore.listSessionsWithKeys(user.userId);
    const current = entries.find((e) => e.session.sessionId === user.sessionId);
    if (!current?.session.deviceId) return false;

    await this.prisma.device.update({
      where: { id: current.session.deviceId },
      data: { trusted: true },
    });

    return true;
  }
}
