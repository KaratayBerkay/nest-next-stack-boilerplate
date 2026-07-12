import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NotificationService } from './notification.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';

@Controller('api')
@UseGuards(SessionAuthGuard)
export class NotificationController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly logger: Logger,
  ) {}

  @Get('notifications')
  async list(
    @CurrentUser() user: JwtUser,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    const pageSize = Math.min(
      Math.max(parseInt(take ?? '20', 10) || 20, 1),
      100,
    );
    const raw = await this.notifications.findByUser(
      user.userId,
      cursor,
      pageSize,
    );
    const hasMore = raw.length > pageSize;
    const items = hasMore ? raw.slice(0, pageSize) : raw;
    return {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        readAt: n.readAt?.toISOString?.() ?? n.readAt ?? undefined,
        payload: (n.payload ?? {}) as Record<string, unknown>,
        createdAt: n.createdAt.toISOString?.() ?? n.createdAt,
        actor: n.actor
          ? {
              id: n.actor.id,
              name: n.actor.name,
              email: n.actor.email,
              avatarUrl: (n.actor as Record<string, unknown>).avatarUrl as
                string | null,
            }
          : null,
      })),
      hasMore,
    };
  }

  @Get('notifications/unread-count')
  async unreadCount(@CurrentUser() user: JwtUser) {
    return user.unread ?? this.notifications.unreadCount(user.userId);
  }

  @Post('notifications/read')
  async markRead(
    @CurrentUser() user: JwtUser,
    @Body() body: { all?: boolean; id?: string },
  ) {
    if (body.all) {
      await this.notifications.markAllRead(user.userId);
    } else if (body.id) {
      await this.notifications.markRead(body.id, user.userId);
    }
    return { success: true };
  }
}
