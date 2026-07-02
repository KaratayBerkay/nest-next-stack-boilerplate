import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { TokenStoreService } from '../auth/token-store.service';
import type { JwtPayload } from '../auth/auth.types';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  handleConnection(client: Socket): void {
    const auth = client.handshake.auth as Record<string, string | undefined>;
    const accessToken = auth.accessToken;
    const rbacToken = auth.rbacToken;
    const deviceToken = auth.deviceToken;
    const userToken = auth.userToken;

    // Try full 4-token auth first.
    if (accessToken && rbacToken && deviceToken && userToken) {
      const key = this.tokenStore.buildKey(
        accessToken,
        rbacToken,
        deviceToken,
        userToken,
      );
      this.tokenStore
        .read(key)
        .then((hash) => {
          if (hash?.userId) {
            (client.data as Record<string, unknown>).userId = hash.userId;
            client.join(`user:${hash.userId}`);
          } else {
            client.disconnect();
          }
        })
        .catch(() => client.disconnect());
      return;
    }

    // Fall back to JWT-only (legacy clients).
    const token = auth.token;
    if (!token || typeof token !== 'string') {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      (client.data as Record<string, unknown>).userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  sendToUser(userId: string, data: object): void {
    this.server.to(`user:${userId}`).emit('notification', data);
  }
}
