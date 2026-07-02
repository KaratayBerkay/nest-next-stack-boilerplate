import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

// docs.nestjs.com/interceptors — "More operators". Aborts a handler that runs too long: RxJS
// `timeout` raises a `TimeoutError`, which we map to a 408 RequestTimeoutException (any other error
// is re-thrown unchanged). The docs hard-code 5000ms; we accept it via the constructor so a test
// can bind `new TimeoutInterceptor(50)` and trigger the timeout deterministically.
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly ms = 5000) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.ms),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
