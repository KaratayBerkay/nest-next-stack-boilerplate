import { Injectable, Logger } from '@nestjs/common';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { FriendsService } from '../friends/friends.service';
import { MessagingWsGateway } from '../messaging/messaging-ws.gateway';

@Injectable()
export class WsNotificationBridge {
  private readonly logger = new Logger(WsNotificationBridge.name);

  constructor(
    private readonly derivation: TokenDerivationService,
    private readonly friends: FriendsService,
    private readonly wsGateway: MessagingWsGateway,
  ) {}

  notifyUser(
    userToken: string,
    service: string,
    payload: Record<string, unknown>,
  ): void {
    const sent = this.wsGateway.sendToService(userToken, service, payload);
    if (sent === 0) {
      this.logger.debug(`notifyUser: no connections for service=${service}`);
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
    for (const friendId of friendIds) {
      const userToken = this.derivation.deriveUserToken(friendId);
      const payload = buildPayload(friendId);
      this.notifyUser(userToken, service, payload);
    }
  }
}
