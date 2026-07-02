import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class PostEventsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-post')
  handleJoinPost(client: Socket, postId: string): void {
    client.join(`post:${postId}`);
  }

  @SubscribeMessage('leave-post')
  handleLeavePost(client: Socket, postId: string): void {
    client.leave(`post:${postId}`);
  }

  broadcastPostUpdate(postId: string): void {
    this.server.to(`post:${postId}`).emit('post-updated', { postId });
  }
}
