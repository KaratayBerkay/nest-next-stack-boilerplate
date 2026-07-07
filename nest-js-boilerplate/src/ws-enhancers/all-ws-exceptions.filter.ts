import { Catch, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { parseDeviceType } from '../common/utils/device-type';

/**
 * Catch-everything filter (websockets/exception-filters, #69). `@Catch()` with no
 * argument catches *any* thrown value — including plain `Error`s that aren't a
 * `WsException`. Extending `BaseWsExceptionFilter` and delegating to `super.catch()`
 * reuses the framework's default handling: unknown errors become a generic
 * `{ status: 'error', message: 'Internal server error' }` on the `'exception'` event.
 * The override is the hook point for custom logic (logging/metrics) before delegating.
 */
@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(AllWsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const userAgent = client.handshake?.headers?.['user-agent'];

    this.logger.log({
      category: 'websocket-exception',
      event: 'exception.websocket',
      socketId: client.id,
      ip: client.handshake?.address,
      userAgent,
      deviceType: parseDeviceType(userAgent),
      errorMessage:
        exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    super.catch(exception, host);
  }
}
