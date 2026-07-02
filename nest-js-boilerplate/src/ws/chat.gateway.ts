import {
  Ack,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import { Observable, from, map } from 'rxjs';
import { Server, Socket } from 'socket.io';

/**
 * Platform-agnostic WebSocket gateway on the socket.io adapter. With no port argument it
 * shares the app's HTTP server/port (the usual case) — passing a port would open a second,
 * standalone server. Demonstrates every documented response style plus the lifecycle hooks.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private online = 0;

  afterInit(server: Server): void {
    // Gateway is ready; `server` (=== this.server) is the live socket.io instance.
    this.server = server;
  }

  handleConnection(_client: Socket): void {
    this.online += 1;
    this.server.emit('presence', { online: this.online });
  }

  handleDisconnect(_client: Socket): void {
    this.online = Math.max(0, this.online - 1);
    this.server.emit('presence', { online: this.online });
  }

  /** Single response: the returned value is delivered to the client's ack callback. */
  @SubscribeMessage('echo')
  echo(@MessageBody() data: unknown): unknown {
    return data;
  }

  /** @Ack(): resolve the client's acknowledgement explicitly from inside the handler. */
  @SubscribeMessage('ping')
  ping(@Ack() ack: (response: unknown) => void): void {
    ack({ pong: true });
  }

  /** WsResponse: emit a named 'message' event back to the sender + broadcast to everyone else. */
  @SubscribeMessage('message')
  message(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ): WsResponse<{ text: string; from: string }> {
    const payload = { text: data.text, from: client.id };
    client.broadcast.emit('message', payload);
    return { event: 'message', data: payload };
  }

  /** Observable: one request -> many responses (streams 'countdown' events 3, 2, 1). */
  @SubscribeMessage('countdown')
  countdown(): Observable<WsResponse<number>> {
    return from([3, 2, 1]).pipe(map((n) => ({ event: 'countdown', data: n })));
  }
}
