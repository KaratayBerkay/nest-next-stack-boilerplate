import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Socket } from 'socket.io';

/**
 * WebSocket guard (websockets/guards, #71). `CanActivate` is identical to an HTTP
 * guard; only the execution context differs — the connected socket is read via
 * `switchToWs().getClient()`, and authorization is derived from its handshake auth
 * token. Returning `false` makes the framework throw `WsException('Forbidden resource')`,
 * which the default filter surfaces to the client as an `'exception'` event.
 */
@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const auth = client.handshake.auth as { token?: string };
    return auth.token === 'valid-token';
  }
}
