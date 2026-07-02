import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { SseController } from './sse.controller';

@Module({
  controllers: [SseController],
  providers: [EventsService],
  exports: [EventsService],
})
export class SseModule {}
