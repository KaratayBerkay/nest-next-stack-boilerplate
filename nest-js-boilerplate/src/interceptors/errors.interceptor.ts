import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// docs.nestjs.com/interceptors — "Exception mapping". Overrides thrown exceptions: any error from
// the handler stream is caught and re-thrown as a 502 BadGateway, decoupling clients from the
// handler's internal failure types.
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(() => throwError(() => new BadGatewayException())));
  }
}
