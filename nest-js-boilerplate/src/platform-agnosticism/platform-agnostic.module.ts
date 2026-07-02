import { Module } from '@nestjs/common';
import { AgnosticController } from './agnostic.controller';
import { GreetingLogicService } from './greeting-logic.service';

// The exact same module + provider is consumed by an HTTP application and by a standalone
// (no-HTTP) application context in the e2e — "build once, use everywhere".
@Module({
  controllers: [AgnosticController],
  providers: [GreetingLogicService],
  exports: [GreetingLogicService],
})
export class PlatformAgnosticModule {}
