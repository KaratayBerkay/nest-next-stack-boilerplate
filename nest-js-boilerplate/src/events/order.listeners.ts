import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from './order-created.event';
import { RecordedEventsService } from './recorded-events.service';

interface InventoryReservation {
  warehouse: string;
  sku: string;
  reserved: number;
}

@Injectable()
export class OrderListeners {
  constructor(private readonly recorded: RecordedEventsService) {}

  // Exact-name listener.
  @OnEvent('order.created')
  handleOrderCreated(payload: OrderCreatedEvent): void {
    this.recorded.record({
      channel: 'order.created',
      orderId: payload.orderId,
      item: payload.item,
    });
  }

  // Single-level wildcard (requires `wildcard: true`) — also matches order.created.
  @OnEvent('order.*')
  handleAnyOrderEvent(payload: OrderCreatedEvent): void {
    this.recorded.record({
      channel: 'order.*',
      orderId: payload.orderId,
      item: payload.item,
    });
  }

  // Two listeners for the same event: emitAsync aggregates both return values.
  @OnEvent('inventory.requested')
  reserveFromWarehouseA(sku: string): InventoryReservation {
    return { warehouse: 'A', sku, reserved: 3 };
  }

  @OnEvent('inventory.requested')
  reserveFromWarehouseB(sku: string): InventoryReservation {
    return { warehouse: 'B', sku, reserved: 5 };
  }
}
