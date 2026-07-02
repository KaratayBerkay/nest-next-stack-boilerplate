import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// docs.nestjs.com/interceptors — a second response-mapping example: rewrite `null` handler results
// to an empty string so clients never receive a bare null.
@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(map((value: unknown) => (value === null ? '' : value)));
  }
}
