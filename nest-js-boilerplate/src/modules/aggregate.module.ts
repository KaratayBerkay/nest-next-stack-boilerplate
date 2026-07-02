import { Module } from '@nestjs/common';
import { GreetingModule } from './greeting.module';

// Module RE-EXPORT: AggregateModule imports GreetingModule and exports it again, so a module
// importing only AggregateModule still gets GreetingService (a "core/aggregate module" pattern).
@Module({
  imports: [GreetingModule],
  exports: [GreetingModule],
})
export class AggregateModule {}
