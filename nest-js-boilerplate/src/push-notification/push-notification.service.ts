import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WebPushError } from 'web-push';
import * as webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    if (publicKey && privateKey) {
      webPush.setVapidDetails(
        this.config.get<string>('VAPID_SUBJECT', 'mailto:admin@example.com'),
        publicKey,
        privateKey,
      );
    }
  }

  async sendToUser(
    userId: string,
    title: string,
    body?: string,
    icon?: string,
    data?: Record<string, unknown>,
  ) {
    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });
    const results = await Promise.allSettled(
      subs.map((sub) =>
        webPush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({ title, body, icon, data }),
          )
          .catch(async (err: WebPushError) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await this.prisma.pushSubscription.delete({
                where: { id: sub.id },
              });
              this.logger.warn(`Removed expired push sub ${sub.id}`);
            }
            throw err;
          }),
      ),
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      this.logger.warn(
        `Push send: ${failed}/${subs.length} failed for user ${userId}`,
      );
    }
    return { sent: results.length - failed, failed };
  }
}
