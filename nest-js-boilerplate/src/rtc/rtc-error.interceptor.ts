import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { rtcErrorLog } from './rtc-logger';

interface GraphqlContext {
  req?: { user?: { userId?: string } };
}

interface GraphqlInfo {
  fieldName?: string;
  parentType?: { name?: string };
}

/** Logs resolver failures with the RTC operation and correlation context intact. */
@Injectable()
export class RtcErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RtcErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const args = context.getArgs();
    const gqlContext = args[2] as GraphqlContext | undefined;
    const info = args[3] as GraphqlInfo | undefined;
    const operation =
      info?.parentType?.name && info.fieldName
        ? `${info.parentType.name}.${info.fieldName}`
        : 'graphql.unknown';

    return next.handle().pipe(
      catchError((error: unknown) => {
        const httpStatus =
          error instanceof HttpException ? error.getStatus() : 500;
        const fields = {
          operation,
          userId: gqlContext?.req?.user?.userId,
          httpStatus,
        };
        const log =
          httpStatus >= 500
            ? this.logger.error.bind(this.logger)
            : this.logger.log.bind(this.logger);
        log(
          rtcErrorLog(
            httpStatus >= 500
              ? 'graphql.operation_failed'
              : 'graphql.operation_rejected',
            error,
            fields,
          ),
        );
        return throwError(() => error);
      }),
    );
  }
}
