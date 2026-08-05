import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { UsageService } from './usage.service';

@Controller('api')
@UseGuards(SessionAuthGuard)
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get('usage/messages')
  async messageUsage(
    @CurrentUser() user: JwtUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const now = new Date();
    const toDate = to ? new Date(to) : now;
    const fromDate = from
      ? new Date(from)
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return this.usage.getMessageUsage(
      user.userId,
      (user.tier as SubscriptionTier) ?? SubscriptionTier.FREE,
      fromDate,
      toDate,
    );
  }
}
