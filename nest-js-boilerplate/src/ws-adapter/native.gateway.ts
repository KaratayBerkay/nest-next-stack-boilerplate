import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';

/**
 * WebSockets › Adapters (#73). A completely platform-agnostic gateway: the exact same
 * `@SubscribeMessage` handlers run unchanged whether the app is bootstrapped on the
 * default socket.io `IoAdapter` or the lightweight `ws`-library `WsAdapter`. The e2e
 * swaps in `WsAdapter` (via `app.useWebSocketAdapter`), proving the alternative adapter.
 * No `namespace` is declared — the `ws` adapter does not support namespaces.
 */
@WebSocketGateway()
export class NativeGateway {
  @SubscribeMessage('echo')
  echo(@MessageBody() data: unknown): WsResponse<unknown> {
    return { event: 'echo', data };
  }

  @SubscribeMessage('sum')
  sum(@MessageBody() data: { a: number; b: number }): WsResponse<number> {
    return { event: 'sum', data: data.a + data.b };
  }
}
