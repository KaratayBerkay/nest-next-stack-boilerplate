import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Formats any {@link HttpException} into a consistent JSON envelope — the docs' Exception filters
 * example (`statusCode` / `timestamp` / `path`) plus `message`, so clients keep the cause instead
 * of having it dropped.
 *
 * Bound at HTTP **route/controller** scope only (`@UseFilters`), never globally: it reads the
 * response via `host.switchToHttp()`, and in this hybrid app (GraphQL/WS/gRPC) a globally-bound
 * `@Catch` filter would run on non-HTTP contexts where there is no Express response to write to.
 * See the Docs issues log entry for Exception filters.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // HttpException's response is a string (raw `new HttpException('msg', status)`) or an object
    // ({ message, error, statusCode }) for the built-in subclasses — normalise to a message string.
    const payload = exception.getResponse();
    const message =
      typeof payload === 'string'
        ? payload
        : ((payload as { message?: unknown }).message ?? exception.message);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
