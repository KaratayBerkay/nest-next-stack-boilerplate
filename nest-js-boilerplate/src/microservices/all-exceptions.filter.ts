import { Catch } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

/**
 * Microservices › Exception filters › Inheritance (#82). A catch-everything `@Catch()` filter
 * that extends the **core** `BaseRpcExceptionFilter` and delegates to `super.catch()`. For a
 * non-`RpcException` (a plain `Error`), the base filter logs it and returns the canonical
 * unknown-error shape `{ status: 'error', message: 'Internal server error' }`.
 */
@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Observable<unknown> {
    return super.catch(exception, host);
  }
}
