import { Module } from '@nestjs/common';
import { CatchEverythingFilter } from './catch-everything.filter';
import { ErrorsController } from './errors.controller';
import { HttpExceptionFilter } from './http-exception.filter';

/**
 * Exception filters feature (#6). The filters are registered as providers so Nest resolves their
 * dependencies (e.g. {@link CatchEverythingFilter}'s `HttpAdapterHost`) when they are referenced by
 * class in `@UseFilters` on {@link ErrorsController}.
 */
@Module({
  controllers: [ErrorsController],
  providers: [HttpExceptionFilter, CatchEverythingFilter],
})
export class ExceptionFiltersModule {}
