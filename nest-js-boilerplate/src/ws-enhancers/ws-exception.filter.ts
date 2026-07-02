import { Catch } from '@nestjs/common';
import type { ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

/**
 * Custom `@Catch(WsException)` filter (websockets/exception-filters, #69). Bound per
 * handler via `@UseFilters`, it overrides the framework's default `'exception'` event:
 * it reshapes the error and emits it on a bespoke `'custom-error'` event instead,
 * proving method-scoped control over how a `WsException` reaches the client.
 */
@Catch(WsException)
export class CustomWsExceptionFilter implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    const detail = typeof error === 'string' ? error : JSON.stringify(error);
    client.emit('custom-error', { code: 'WS_HANDLED', detail });
  }
}
