import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CallProbe } from './call-probe.service';

/**
 * Standalone applications (#86) — a global interceptor (registered via `APP_INTERCEPTOR` in
 * `StandaloneModule`). The docs warn that HTTP enhancers are dormant in a standalone context:
 * retrieving a controller with `app.get()` and calling its method does NOT run this interceptor,
 * because there is no request pipeline to drive it. `intercept()` bumps the probe so the test can
 * assert it was never reached.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly probe: CallProbe) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    this.probe.interceptorCalls += 1;
    return next.handle();
  }
}
