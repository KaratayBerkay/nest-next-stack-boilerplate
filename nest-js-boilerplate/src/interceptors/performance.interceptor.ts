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
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, ip, headers } = request;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log({
            category: 'performance',
            event: 'perf.slow_request',
            method,
            path: request.originalUrl ?? request.url,
            durationMs,
            statusCode: response.statusCode,
            ip,
            userAgent: headers?.['user-agent'],
            deviceType: parseDeviceType(headers?.['user-agent']),
          });
        }
      }),
    );
  }
}