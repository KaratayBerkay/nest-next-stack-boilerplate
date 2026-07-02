import { Injectable } from '@nestjs/common';

export interface RecordedEvent {
  channel: string;
  orderId: number;
  item: string;
}

/**
 * Singleton sink the listeners write to and the controller reads back, so an e2e
 * can observe (over HTTP) that a `@OnEvent` handler actually fired.
 */
@Injectable()
export class RecordedEventsService {
  private readonly events: RecordedEvent[] = [];

  record(event: RecordedEvent): void {
    this.events.push(event);
  }

  all(): RecordedEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }
}
