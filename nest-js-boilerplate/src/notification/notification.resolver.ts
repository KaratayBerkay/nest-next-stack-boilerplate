import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Notification } from '../@generated/notification/notification.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { deepEncryptIds } from '../common/id-codec/id-codec.util';
import { NotificationService } from './notification.service';
import { NotificationsPage } from './models/notifications-page.model';

@UseGuards(SessionAuthGuard)
@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => NotificationsPage)
  async myNotifications(
    @CurrentUser() user: JwtUser,
    @Args('cursor', { type: () => ID, nullable: true }) cursor?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    // findByUser over-fetches by one (see notification.service.ts) so the
    // caller can tell "more exist" apart from "that was the last page".
    const pageSize = Math.min(Math.max(take ?? 20, 1), 100);
    const raw = await this.notificationService.findByUser(
      user.userId,
      cursor,
      pageSize,
    );
    const hasMore = raw.length > pageSize;
    const items = hasMore ? raw.slice(0, pageSize) : raw;
    // Same hideAvatar redaction used everywhere else an actor's avatar is
    // exposed (post/friends/messaging resolvers) — this query was the one
    // place it was missing, leaking a hidden avatar to any client that
    // selects actor.avatarUrl.
    //
    // `payload` is a raw JSON scalar (GraphQLJSON) — the schema transformer
    // only encrypts a field by its own name (see encryptFieldIfId), it can't
    // see inside an opaque JSON blob, so ids embedded in it (rtc-call
    // .service.ts's `callId`, comment.service.ts's `postId`/`commentId`,
    // messaging-dm.service.ts's `senderId`, ...) would otherwise reach the
    // client as raw database uuids. Same content the WS push already
    // protects for free via RealtimeGateway's socket-level encrypt — this is
    // the GraphQL read path for the same data, so it needs its own pass.
    return {
      items: items.map((n) => ({
        ...n,
        payload: deepEncryptIds(n.payload ?? {}),
        actor:
          n.actor && n.actor.id !== user.userId && n.actor.hideAvatar
            ? { ...n.actor, avatarUrl: null }
            : n.actor,
      })),
      hasMore,
    };
  }

  @Query(() => Int)
  unreadNotificationCount(@CurrentUser() user: JwtUser) {
    // Serve from the Redis hash snapshot — zero PG on the hot path.
    return user.unread ?? this.notificationService.unreadCount(user.userId);
  }

  @Mutation(() => Boolean)
  async markNotificationRead(
    @CurrentUser() user: JwtUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const result = await this.notificationService.markRead(id, user.userId);
    return result.count > 0;
  }

  @Mutation(() => Boolean)
  async markAllNotificationsRead(@CurrentUser() user: JwtUser) {
    await this.notificationService.markAllRead(user.userId);
    return true;
  }
}
