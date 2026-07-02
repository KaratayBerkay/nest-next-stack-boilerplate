import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { GreetingModule } from './greeting.module';

// Imports GreetingModule to gain access to its exported GreetingService.
@Module({
  imports: [GreetingModule],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
