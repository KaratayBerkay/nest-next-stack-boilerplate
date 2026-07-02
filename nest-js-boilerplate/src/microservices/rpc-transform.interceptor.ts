import { Injectable } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

/**
 * Microservices › Interceptors (#85). "There is no difference between regular interceptors and
 * microservices interceptors" — this is the exact same `map`-to-`{ data }` envelope shape used
 * over HTTP, here wrapping the result of an RPC message handler.
 */
@Injectable()
export class RpcTransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: unknown }> {
    return next.handle().pipe(map((data: unknown) => ({ data })));
  }
}
