import { Module } from '@nestjs/common';
import { HostAService } from './host-a.service';
import { HostBService } from './host-b.service';
import { RequestScopedService } from './request-scoped.service';
import { ScopesDemoController } from './scopes-demo.controller';
import { SingletonService } from './singleton.service';
import { TransientService } from './transient.service';

// Standalone demo of the three injection scopes (DEFAULT/REQUEST/TRANSIENT). Not in AppModule —
// request-scoped providers carry a latency cost, so this is exercised in an isolated app.
@Module({
  controllers: [ScopesDemoController],
  providers: [
    SingletonService,
    TransientService,
    HostAService,
    HostBService,
    RequestScopedService,
  ],
  exports: [SingletonService, TransientService, HostAService, HostBService],
})
export class InjectionScopesModule {}
