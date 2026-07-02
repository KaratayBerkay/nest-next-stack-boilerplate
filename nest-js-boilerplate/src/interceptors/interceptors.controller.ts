import {
  Controller,
  Get,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from './cache.interceptor';
import { ErrorsInterceptor } from './errors.interceptor';
import { ExcludeNullInterceptor } from './exclude-null.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { TimeoutInterceptor } from './timeout.interceptor';
import { TransformInterceptor } from './transform.interceptor';

// One route per documented interceptor pattern, each binding its interceptor at method scope via
// @UseInterceptors. test/interceptors.e2e-spec.ts drives each route and asserts the documented
// behaviour. (The same interceptors can be bound controller-wide or globally via
// app.useGlobalInterceptors / APP_INTERCEPTOR — see interceptors.module.ts.)
@Controller('interceptors')
export class InterceptorsController {
  // Response mapping: the raw return value is wrapped in `{ data }` by the interceptor.
  @Get('transform')
  @UseInterceptors(TransformInterceptor)
  transform(): { id: number; name: string } {
    return { id: 1, name: 'cat' };
  }

  // Response mapping: a `null` result is rewritten to '' before it reaches the client.
  @Get('nullable')
  @UseInterceptors(ExcludeNullInterceptor)
  nullable(): null {
    return null;
  }

  // Pre/post logging around the handler; the handler itself is a plain pass-through.
  @Get('logging')
  @UseInterceptors(LoggingInterceptor)
  logging(): { ok: true } {
    return { ok: true };
  }

  // Override: when `x-cache: hit` is sent the interceptor short-circuits with a cached value and
  // this handler never runs. We throw here so a successful (non-error) response proves the skip.
  @Get('cache')
  @UseInterceptors(CacheInterceptor)
  cache(): string[] {
    throw new InternalServerErrorException(
      'handler should not run when cached',
    );
  }

  // Exception mapping: a 500 thrown here is rewritten to a 502 BadGateway by the interceptor.
  @Get('error')
  @UseInterceptors(ErrorsInterceptor)
  error(): never {
    throw new InternalServerErrorException('boom');
  }

  // Timeout: this handler resolves after 200ms; the bound interceptor (50ms budget) aborts it
  // with a 408 first. Bound as an instance so the budget can be set short for the test.
  @Get('timeout')
  @UseInterceptors(new TimeoutInterceptor(50))
  async timeout(): Promise<{ ok: true }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ok: true };
  }

  // Same interceptor, fast handler: completes well within the budget and returns normally.
  @Get('fast')
  @UseInterceptors(new TimeoutInterceptor(50))
  fast(): { ok: true } {
    return { ok: true };
  }
}
