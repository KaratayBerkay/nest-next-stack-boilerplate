import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Notification } from '../@generated/notification/notification.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
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
    // caller can tell "more exist" apart from "that was the last page" —
    // mirrors NotificationController.list's own slicing exactly.
    const pageSize = Math.min(Math.max(take ?? 20, 1), 100);
    const raw = await this.notificationService.findByUser(
      user.userId,
      cursor,
      pageSize,
    );
    const hasMore = raw.length > pageSize;
    return { items: hasMore ? raw.slice(0, pageSize) : raw, hasMore };
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
