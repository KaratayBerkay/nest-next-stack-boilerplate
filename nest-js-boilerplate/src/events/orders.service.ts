import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from './order-created.event';

@Injectable()
export class OrdersService {
  private seq = 0;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  create(item: string): OrderCreatedEvent {
    const event = new OrderCreatedEvent(++this.seq, item);
    // emit() is synchronous: every matching @OnEvent listener has run by the time
    // this returns (no readiness watcher needed — we're well past bootstrap).
    this.eventEmitter.emit('order.created', event);
    return event;
  }

  // emitAsync awaits every matching listener and resolves with their return values.
  requestInventory(sku: string): Promise<unknown[]> {
    return this.eventEmitter.emitAsync('inventory.requested', sku);
  }
}
