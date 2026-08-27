import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WebPushError } from 'web-push';
import * as webPush from 'web-push';
import {
  cert,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma/prisma.service';
import { deepEncryptIds } from '../common/id-codec/id-codec.util';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  // undefined until/unless FIREBASE_SERVICE_ACCOUNT_JSON is configured — every
  // FCM send site below must treat that as "mobile push isn't configured
  // here" and no-op, not throw. Most environments (including local dev)
  // won't have real Firebase credentials.
  private fcmApp: App | undefined;

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

    const serviceAccountJson = this.config.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
        this.fcmApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (err) {
        this.logger.error(
          `Invalid FIREBASE_SERVICE_ACCOUNT_JSON — FCM push disabled: ${(err as Error).message}`,
        );
      }
    } else {
      this.logger.debug(
        'FIREBASE_SERVICE_ACCOUNT_JSON not set — mobile (FCM) push disabled, Web Push unaffected',
      );
    }
  }

  private async sendFcm(
    userId: string,
    title: string,
    body?: string,
    data?: Record<string, unknown>,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.fcmApp) return { sent: 0, failed: 0 };

    const tokens = await this.prisma.fcmToken.findMany({ where: { userId } });
    if (tokens.length === 0) return { sent: 0, failed: 0 };

    const stringData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data ?? {})) {
      stringData[key] =
        typeof value === 'string' ? value : JSON.stringify(value);
    }

    let sent = 0;
    let failed = 0;
    await Promise.all(
      tokens.map(async (t) => {
        try {
          await getMessaging(this.fcmApp).send({
            token: t.token,
            notification: { title, body },
            data: stringData,
          });
          sent += 1;
        } catch (err) {
          failed += 1;
          const code = (err as { code?: string }).code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            await this.prisma.fcmToken
              .delete({ where: { id: t.id } })
              .catch(() => undefined);
            this.logger.warn(`Removed expired FCM token ${t.id}`);
          } else {
            this.logger.warn(
              `FCM send failed for token ${t.id}: ${(err as Error).message}`,
            );
          }
        }
      }),
    );
    return { sent, failed };
  }

  async sendToUser(
    userId: string,
    title: string,
    body?: string,
    icon?: string,
    data?: Record<string, unknown>,
  ) {
    // Web Push and FCM are both delivered straight through a third-party
    // service (browser push endpoints / Firebase), completely outside the
    // REST/GraphQL/WS transport boundary the id-codec interceptors guard —
    // so unlike a WS frame (encrypted for free by RealtimeGateway's
    // socket-level send() wrapper) or a REST response body, nothing else
    // protects a raw database id put in `data` for deep-link purposes
    // (e.g. rtc-call.service.ts's `{ kind: 'rtc-missed-call', callId }`,
    // messaging-dm.service.ts's `{ kind: 'direct-message', senderId }').
    // Encrypt once here so every caller is covered without having to
    // remember to do it themselves.
    const encryptedData = data
      ? (deepEncryptIds(data) as Record<string, unknown>)
      : data;

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
            JSON.stringify({ title, body, icon, data: encryptedData }),
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
    const webPushFailed = results.filter((r) => r.status === 'rejected').length;
    if (webPushFailed > 0) {
      this.logger.warn(
        `Push send: ${webPushFailed}/${subs.length} failed for user ${userId}`,
      );
    }

    const fcm = await this.sendFcm(userId, title, body, encryptedData);

    return {
      sent: results.length - webPushFailed + fcm.sent,
      failed: webPushFailed + fcm.failed,
    };
  }
}
