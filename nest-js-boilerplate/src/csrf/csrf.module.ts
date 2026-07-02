import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CsrfController } from './csrf.controller';
import { doubleCsrfProtection } from './csrf.middleware';

// CSRF is applied per-module (not globally) so it can't break the bearer-token GraphQL/REST
// API. cookie-parser must run before doubleCsrfProtection so the CSRF cookie can be read.
@Module({ controllers: [CsrfController] })
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(cookieParser(), doubleCsrfProtection)
      .forRoutes(CsrfController);
  }
}
