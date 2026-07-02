import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// docs.nestjs.com/interceptors — "Aspect interception". Runs logic *before* the route handler
// (synchronously, before `next.handle()`) and *after* it completes (inside `tap`, when the
// response stream emits). The docs use `console.log`; we use Nest's Logger so a test can spy on
// it and prove both phases ran around the handler.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    this.logger.log('Before...');
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => this.logger.log(`After... ${Date.now() - now}ms`)));
  }
}
