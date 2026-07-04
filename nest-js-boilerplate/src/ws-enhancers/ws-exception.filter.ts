import { Catch, Logger } from '@nestjs/common';
import type { ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { parseDeviceType } from '../common/utils/device-type';

/**
 * Custom `@Catch(WsException)` filter (websockets/exception-filters, #69). Bound per
 * handler via `@UseFilters`, it overrides the framework's default `'exception'` event:
 * it reshapes the error and emits it on a bespoke `'custom-error'` event instead,
 * proving method-scoped control over how a `WsException` reaches the client.
 */
@Catch(WsException)
export class CustomWsExceptionFilter implements WsExceptionFilter {
  private readonly logger = new Logger(CustomWsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    const detail = typeof error === 'string' ? error : JSON.stringify(error);
    const userAgent = client.handshake?.headers?.['user-agent'];

    this.logger.log({
      category: 'exception',
      event: 'exception.ws_handled',
      socketId: client.id,
      ip: client.handshake?.address,
      userAgent,
      deviceType: parseDeviceType(userAgent),
      detail,
    });

    client.emit('custom-error', { code: 'WS_HANDLED', detail });
  }
}
