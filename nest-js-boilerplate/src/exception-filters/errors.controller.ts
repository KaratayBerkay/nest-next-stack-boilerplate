import {
  Controller,
  ForbiddenException,
  Get,
  UseFilters,
} from '@nestjs/common';
import { CatchEverythingFilter } from './catch-everything.filter';
import { HttpExceptionFilter } from './http-exception.filter';
import { TeapotException } from './teapot.exception';

/**
 * Proof surface for checklist #6 (Exception filters). Each route throws so the e2e can assert how
 * the exception is rendered — by Nest's built-in handler vs. our custom filters. Not domain logic.
 */
@Controller('errors')
export class ErrorsController {
  /** No filter → Nest's built-in HttpException handling + default JSON shape. */
  @Get('builtin')
  builtin(): never {
    throw new ForbiddenException('no entry');
  }

  /** `@Catch(HttpException)` filter → the documented `{ statusCode, timestamp, path }` envelope. */
  @Get('custom')
  @UseFilters(HttpExceptionFilter)
  custom(): never {
    throw new ForbiddenException('no entry');
  }

  /** A custom HttpException subclass under the same filter → its own status (418) in the envelope. */
  @Get('teapot')
  @UseFilters(HttpExceptionFilter)
  teapot(): never {
    throw new TeapotException();
  }

  /** Catch-everything filter → a non-HTTP error is mapped to 500 and replied via the HttpAdapter. */
  @Get('unknown')
  @UseFilters(CatchEverythingFilter)
  unknown(): never {
    throw new Error('boom');
  }
}
