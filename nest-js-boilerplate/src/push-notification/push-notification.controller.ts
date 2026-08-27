import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';

/**
 * Mobile's PushNotificationService._registerToken() has always posted here —
 * this route just never existed backend-side (see docs/issues.md CROSS-021).
 * Web Push subscriptions (PushSubscriptionResolver) are a separate,
 * GraphQL-only surface; this one exists purely to match the REST contract
 * the Flutter client already speaks.
 */
@UseGuards(SessionAuthGuard)
@Controller('push-notifications')
export class PushNotificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('register')
  async register(
    @CurrentUser() user: JwtUser,
    @Body() dto: RegisterFcmTokenDto,
  ): Promise<{ ok: true }> {
    await this.prisma.fcmToken.upsert({
      where: { token: dto.token },
      create: { token: dto.token, platform: dto.platform, userId: user.userId },
      update: { userId: user.userId, platform: dto.platform },
    });
    return { ok: true };
  }
}
