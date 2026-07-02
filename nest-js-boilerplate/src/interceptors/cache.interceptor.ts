import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, of } from 'rxjs';

// docs.nestjs.com/interceptors — "Overriding the method entirely". When a value is returned with
// `of(...)` *instead of* calling `next.handle()`, the route handler never runs (a cache short
// circuit). The docs hard-code `isCached = true`; we drive it from an `x-cache: hit` header so a
// test can prove both branches — the short circuit and the normal pass-through to the handler.
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const isCached = request.headers['x-cache'] === 'hit';
    if (isCached) {
      return of(['cached']);
    }
    return next.handle();
  }
}
