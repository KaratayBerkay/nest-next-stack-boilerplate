import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Notification } from '../@generated/notification/notification.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(SessionAuthGuard)
@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification])
  myNotifications(
    @CurrentUser() user: JwtUser,
    @Args('cursor', { type: () => ID, nullable: true }) cursor?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.notificationService.findByUser(user.userId, cursor, take);
  }

  @Query(() => Int)
  unreadNotificationCount(@CurrentUser() user: JwtUser) {
    return this.notificationService.unreadCount(user.userId);
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
