import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { toExceptionResponse } from '../common/exceptions/to-exception-response';
import { parseDeviceType } from '../common/utils/device-type';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      if (exception instanceof HttpException) throw exception;
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = toExceptionResponse(exception);

    const statusCode = response.statusCode;
    const isServerError = statusCode >= 500;

    this.logger.log({
      category: 'exception',
      event: isServerError ? 'exception.unhandled' : 'exception.handled',
      httpStatus: statusCode,
      path: httpAdapter.getRequestUrl(request) as string,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers?.['user-agent'],
      deviceType: parseDeviceType(request.headers?.['user-agent']),
      errorMessage:
        exception instanceof Error ? exception.message : String(exception),
      stack: isServerError
        ? exception instanceof Error
          ? exception.stack
          : undefined
        : undefined,
    });

    httpAdapter.reply(ctx.getResponse(), response, statusCode);
  }
}
