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
    // `endpoint` is @unique — upsert lets Postgres's own unique index
    // (INSERT ... ON CONFLICT) resolve the race atomically. The prior
    // findUnique-then-create/update was a TOCTOU race: two concurrent
    // subscribe() calls for the same endpoint (a service worker
    // re-registering across two open tabs) could both see no existing row
    // and both attempt create(), and the loser's `endpoint` unique
    // constraint violation would surface as a raw 500 instead of the keys
    // simply being (re)saved.
    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth, userAgent },
      update: { p256dh, auth, userAgent, userId },
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
