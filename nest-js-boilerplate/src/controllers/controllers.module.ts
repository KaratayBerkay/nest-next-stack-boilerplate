import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';

// Standalone demo module — intentionally NOT imported by AppModule. The docs' DTOs are
// decorator-free, but the app's global `ValidationPipe({ whitelist: true })` would strip every
// undecorated `@Body` property (the #26 behavior), making the documented routing example behave
// oddly in the running app. So this module is exercised in isolation (no global pipe) by its
// e2e — controllers as a concept are already wired/proven across the app (cookies, cors, health…).
@Module({ controllers: [CatsController] })
export class ControllersModule {}
