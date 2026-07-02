import { Logger, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

/**
 * Automock/Suites (#119) — the real module the unit test mirrors. `UserService` injects
 * `UserRepository` and `Logger`; this module provides all three so the wiring is valid NestJS DI.
 *
 * Standalone (not imported by AppModule): the feature is a *unit-testing* technique, proven by
 * `user.service.spec.ts` driving `UserService` in isolation via Suites — no HTTP surface to add.
 */
@Module({
  providers: [UserService, UserRepository, Logger],
})
export class AutomockModule {}
