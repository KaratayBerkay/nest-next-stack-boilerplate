import { Module } from '@nestjs/common';
import { NativeGateway } from './native.gateway';

/**
 * WebSockets › Adapters (#73). Holds a platform-agnostic gateway proven under the
 * `ws`-library `WsAdapter` (`@nestjs/platform-ws`) — the documented alternative to the
 * default socket.io adapter. The adapter is applied at bootstrap (`useWebSocketAdapter`)
 * by the e2e, not here, so the gateway stays transport-neutral. Standalone (not in
 * AppModule, which runs on socket.io for #68/#69–72).
 */
@Module({ providers: [NativeGateway] })
export class WsAdapterModule {}
