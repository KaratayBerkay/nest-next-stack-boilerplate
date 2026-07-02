import { AsyncLocalStorage } from 'node:async_hooks';
import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { AlsStore } from './als-store';
import { CatsController } from './cats.controller';
import { CatsRepository } from './cats.repository';
import { CatsService } from './cats.service';

/**
 * Async Local Storage (#118) — the docs' custom (built-in `async_hooks`) recipe, kept as one
 * self-contained module instead of leaking middleware wiring into AppModule.
 *
 * - `AsyncLocalStorage` is registered as a single shared provider (value provider) and exported, so
 *   it can be injected anywhere by its class token.
 * - The module's own middleware enters the store with `als.run(...)` at the very start of each
 *   matching request — the docs' recommended entry point, since middleware runs before guards,
 *   interceptors, and the handler, making the store available for the whole request lifecycle.
 * - It is scoped to {@link CatsController} (not `'*'`) so it wraps only this feature's routes and
 *   stays independent of the app's other request handling (e.g. the logging request-id context).
 *
 * Note: this is distinct from `src/logging/request-context.ts`, which uses `AsyncLocalStorage`
 * functionally (module-less) for log correlation. This module demonstrates the *DI* pattern the
 * docs describe — ALS as an injectable provider read by a service.
 */
@Module({
  providers: [
    { provide: AsyncLocalStorage, useValue: new AsyncLocalStorage<AlsStore>() },
    CatsRepository,
    CatsService,
  ],
  controllers: [CatsController],
  exports: [AsyncLocalStorage],
})
export class AlsModule implements NestModule {
  constructor(private readonly als: AsyncLocalStorage<AlsStore>) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply((req: Request, _res: Response, next: NextFunction) => {
        const header = req.headers['x-user-id'];
        const userId =
          (Array.isArray(header) ? header[0] : header) ?? 'anonymous';
        // Everything downstream in this async context — service, repository — sees this store.
        this.als.run({ userId }, () => next());
      })
      .forRoutes(CatsController);
  }
}
