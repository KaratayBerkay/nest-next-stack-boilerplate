import { Module } from '@nestjs/common';
import { InterceptorsController } from './interceptors.controller';

// Self-contained feature module for the docs.nestjs.com/interceptors patterns. The interceptors
// are bound per-route inside the controller via @UseInterceptors (so each route demonstrates one
// pattern in isolation). To apply one app-wide instead, register it globally — either
// `app.useGlobalInterceptors(new LoggingInterceptor())` in main.ts, or as an APP_INTERCEPTOR
// provider here (the DI-friendly form):
//
//   providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }]
//
// We keep it route-scoped here to avoid wrapping every other module's responses in this boilerplate.
@Module({ controllers: [InterceptorsController] })
export class InterceptorsModule {}
