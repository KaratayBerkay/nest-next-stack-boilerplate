import { Injectable } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

/**
 * WebSocket interceptor (websockets/interceptors, #72). The docs note there is no
 * difference between regular and WebSocket interceptors — this is the same
 * response-shaping `NestInterceptor` used over HTTP, wrapping every handler result in
 * a `{ data }` envelope before it is delivered to the client's ack callback.
 */
@Injectable()
export class WsTransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: unknown }> {
    return next.handle().pipe(map((data: unknown) => ({ data })));
  }
}
