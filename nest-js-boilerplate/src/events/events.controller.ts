import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { OrderCreatedEvent } from './order-created.event';
import { OrdersService } from './orders.service';
import {
  RecordedEventsService,
  type RecordedEvent,
} from './recorded-events.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly orders: OrdersService,
    private readonly recorded: RecordedEventsService,
  ) {}

  @Post('orders')
  createOrder(@Body() body: { item: string }): OrderCreatedEvent {
    return this.orders.create(body.item);
  }

  @Get('log')
  log(): RecordedEvent[] {
    return this.recorded.all();
  }

  @Delete('log')
  clear(): { cleared: true } {
    this.recorded.clear();
    return { cleared: true };
  }

  @Post('inventory')
  async inventory(
    @Body() body: { sku: string },
  ): Promise<{ responses: unknown[] }> {
    return { responses: await this.orders.requestInventory(body.sku) };
  }
}
