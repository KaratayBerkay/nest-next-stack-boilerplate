import { Module } from '@nestjs/common';
import { LazyService } from './lazy.service';

// A perfectly ordinary Nest module — no extra changes are required to lazy-load it.
@Module({
  providers: [LazyService],
  exports: [LazyService],
})
export class LazyModule {}
