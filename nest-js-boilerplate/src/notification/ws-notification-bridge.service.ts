import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class WsNotificationBridge {
  private readonly logger = new Logger(WsNotificationBridge.name);
  private readonly wsApiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly derivation: TokenDerivationService,
    private readonly friends: FriendsService,
    config: ConfigService,
  ) {
    this.wsApiUrl =
      config.get<string>('MSG_WS_INTERNAL_URL') ?? 'http://localhost:3003';
    this.apiKey =
      config.get<string>('NOTIFICATION_API_KEY') ??
      'dev-notification-api-key-change-in-production';
  }

  async notifyUser(
    userToken: string,
    service: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const res = await fetch(`${this.wsApiUrl}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-notification-key': this.apiKey,
        },
        body: JSON.stringify({ service, userToken, payload }),
      });
      if (!res.ok) {
        this.logger.warn(
          `notifyUser failed: ${res.status} for service=${service}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `notifyUser error for service=${service}: ${(err as Error).message}`,
      );
    }
  }

  async notifyFriends(
    userId: string,
    service: string,
    buildPayload: (friendId: string) => Record<string, unknown>,
  ): Promise<void> {
    let friendIds: string[];
    try {
      friendIds = await this.friends.getFriendIds(userId);
    } catch (err) {
      this.logger.error(
        `notifyFriends: failed to get friends for ${userId}: ${(err as Error).message}`,
      );
      return;
    }
    await Promise.allSettled(
      friendIds.map(async (friendId) => {
        const userToken = this.derivation.deriveUserToken(friendId);
        const payload = buildPayload(friendId);
        await this.notifyUser(userToken, service, payload);
      }),
    );
  }
}
