import { Module } from '@nestjs/common';
import { LazyConsumerService } from './lazy-consumer.service';

// Note: LazyModule is intentionally NOT imported here — that's the whole point. LazyModuleLoader
// pulls it in on demand at runtime.
@Module({
  providers: [LazyConsumerService],
  exports: [LazyConsumerService],
})
export class LazyLoadingModule {}
