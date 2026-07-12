import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { parseDeviceType } from '../common/utils/device-type';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    let method: string;
    let path: string;
    let ip: string | undefined;
    let userAgent: string | undefined;

    const type = context.getType<'graphql' | 'http' | 'ws'>();

    if (type === 'graphql') {
      const args = context.getArgs();
      const gqlCtx = args[0];
      const info = args[3] as
        | { fieldName?: string; parentType?: { name?: string } }
        | undefined;
      method = 'GRAPHQL';
      path =
        info?.parentType?.name && info?.fieldName
          ? `${info.parentType.name}.${info.fieldName}`
          : 'graphql';
      ip = gqlCtx?.req?.ip;
      userAgent = gqlCtx?.req?.headers?.['user-agent'];
    } else if (type === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      method = request.method;
      path = request.originalUrl ?? request.url;
      ip = request.ip;
      userAgent = request.headers?.['user-agent'];
    } else {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
          let statusCode: number | undefined;
          if (type === 'http') {
            statusCode = context
              .switchToHttp()
              .getResponse<Response>().statusCode;
          }
          this.logger.log({
            category: 'performance',
            event: 'perf.slow_request',
            method,
            path,
            durationMs,
            statusCode,
            ip,
            userAgent,
            deviceType: parseDeviceType(userAgent),
          });
        }
      }),
    );
  }
}
