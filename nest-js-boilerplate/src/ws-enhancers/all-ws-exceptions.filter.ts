import { Catch } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

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
  catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
