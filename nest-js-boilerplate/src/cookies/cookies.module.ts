import { Module } from '@nestjs/common';
import { CookiesController } from './cookies.controller';

// The cookie-parser middleware itself is registered globally in main.ts; this module just
// groups the endpoints that read/write cookies. See test/cookies.e2e-spec.ts for the proof.
@Module({ controllers: [CookiesController] })
export class CookiesModule {}
