import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * Catch-everything filter (docs' "Catch everything"): maps any thrown value to an HTTP status
 * (an {@link HttpException} keeps its status, anything else becomes 500) and replies through the
 * platform-agnostic `HttpAdapter` rather than touching Express directly.
 *
 * Like {@link HttpExceptionFilter}, bound at HTTP route scope in this hybrid app — see that filter's
 * note and the Docs issues log entry.
 */
@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      // HttpAdapter#getRequestUrl is typed `any` on the abstract adapter; it returns the URL string.
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
