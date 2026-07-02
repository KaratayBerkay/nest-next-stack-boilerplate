import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    userAgent?: string,
  ) {
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint },
    });
    if (existing) {
      return this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: { p256dh, auth, userAgent, userId },
      });
    }
    return this.prisma.pushSubscription.create({
      data: { userId, endpoint, p256dh, auth, userAgent },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.pushSubscription.findMany({ where: { userId } });
  }
}
