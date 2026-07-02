import { Module } from '@nestjs/common';
import { ExternalService } from './external.service';

// A sibling module (NOT imported by ModuleReferenceModule) — so its provider is only reachable
// from the consumer via the global, non-strict ModuleRef#get lookup.
@Module({
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {}
