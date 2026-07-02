import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/auth.types';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth.token as string;
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
