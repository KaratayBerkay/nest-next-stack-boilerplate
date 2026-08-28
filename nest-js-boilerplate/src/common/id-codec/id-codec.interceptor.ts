import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { deepDecryptIds, deepEncryptIds } from './id-codec.util';

// Global REST id encrypt/decrypt boundary — decrypts request.body/params
// before the controller runs, encrypts the response body afterward. Query
// strings are handled separately (see main.ts's `query parser` registration):
// Express 5's `req.query` is a live getter that re-parses `req.url` on every
// access rather than caching, so mutating the object here would be silently
// lost the next time anything (including Nest's own @Query() resolution)
// reads req.query.
//
// Guarded to HTTP only: this app enables `fieldResolverEnhancers:
// ['interceptors']` in GraphQLModule.forRoot, which makes every globally
// registered interceptor (this one included) also run per GraphQL field
// resolution. GraphQL already gets its own precise, schema-aware handling
// via id-codec-schema.transformer.ts — running this one too would decrypt/
// encrypt every GraphQL id a second time.
@Injectable()
export class IdCodecInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();
    try {
      if (request.body && typeof request.body === 'object') {
        request.body = deepDecryptIds(request.body);
      }
      if (request.params && typeof request.params === 'object') {
        request.params = deepDecryptIds(
          request.params,
        ) as typeof request.params;
      }
    } catch {
      throw new BadRequestException('Invalid id');
    }

    return next.handle().pipe(
      map((data: unknown) => {
        // A @Res() controller (LiveKit/Stripe webhooks) returns the Express
        // Response object itself — `res.json()` returns `res` for chaining.
        // That's not a payload (the real body is already flushed by the time
        // this map runs), and walking it means recursing through the
        // req<->res<->socket object graph. walk() is cycle-safe now, but
        // there's still nothing to encode — pass it through untouched.
        if (data === response) return data;
        return deepEncryptIds(data);
      }),
    );
  }
}
