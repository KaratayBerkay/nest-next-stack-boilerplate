import { Catch } from '@nestjs/common';
import type { ArgumentsHost, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import type { Observable } from 'rxjs';

/**
 * Microservices › Exception filters (#82). A custom `@Catch(RpcException)` filter. Unlike an
 * HTTP filter, an RPC filter's `catch()` must **return an `Observable`** (the docs' one
 * difference) — the framework merges it into the response stream, so `throwError` surfaces
 * the error on the client's `send()` observable. Here we reshape the error onto a bespoke
 * envelope to prove a custom filter runs.
 */
@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, _host: ArgumentsHost): Observable<never> {
    const error = exception.getError();
    const detail = typeof error === 'string' ? error : JSON.stringify(error);
    return throwError(() => ({ code: 'RPC_HANDLED', detail }));
  }
}
