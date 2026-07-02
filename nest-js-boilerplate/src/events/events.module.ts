import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsController } from './events.controller';
import { OrderListeners } from './order.listeners';
import { OrdersService } from './orders.service';
import { RecordedEventsService } from './recorded-events.service';

/**
 * Techniques › Events (#34). `@nestjs/event-emitter` over eventemitter2.
 * `wildcard: true` + `delimiter: '.'` enables namespaced patterns like `order.*`.
 * `EventEmitterModule.forRoot()` discovers every `@OnEvent` provider in the graph
 * on bootstrap, so listeners bind even though this module is self-contained
 * (standalone — not wired into AppModule).
 */
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' })],
  controllers: [EventsController],
  providers: [OrdersService, OrderListeners, RecordedEventsService],
})
export class EventsModule {}
