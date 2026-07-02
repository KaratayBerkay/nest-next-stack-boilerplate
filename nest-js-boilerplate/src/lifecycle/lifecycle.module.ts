import { Module } from '@nestjs/common';
import { LifecycleService } from './lifecycle.service';

// Standalone module — intentionally NOT imported by AppModule. Its only purpose is to host a
// provider that records lifecycle-hook ordering for the spec; wiring it into the running app
// would add a passive provider with no runtime value. (Lifecycle hooks are already used for
// real in PrismaService / OutboxService — see the checklist.) The spec drives it in isolation.
@Module({
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
