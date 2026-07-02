import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { from } from 'rxjs';
import type { Observable } from 'rxjs';
import { EventLogService } from './event-log.service';

/**
 * Transport-agnostic message/event handlers, identical to the TCP controller (#74) but using
 * **string** patterns — the idiom the broker docs use, and the lowest common denominator across
 * a Redis channel, a NATS subject, an MQTT topic and a Kafka topic (an object pattern would be
 * JSON-stringified onto the wire anyway; `*`/`+`/`/` etc. stay out of the names so the same
 * controller also boots cleanly over Kafka, whose topic names only allow `[a-zA-Z0-9._-]`).
 *
 * One `@Controller()` proves, for whichever transport boots it: request-response (`@MessagePattern`,
 * both a sync result and an Observable multi-response) and event-based delivery (`@EventPattern`,
 * read back over request-response since `emit()` itself returns nothing).
 */
@Controller()
export class BrokerMessagesController {
  constructor(private readonly eventLog: EventLogService) {}

  // Request-response: the canonical docs example. Returns synchronously.
  @MessagePattern('sum')
  sum(@Payload() data: number[]): number {
    return (data ?? []).reduce((a, b) => a + b, 0);
  }

  // Request-response, Observable: each emitted value is delivered as a separate response,
  // gathered client-side via `toArray()`. (Not exercised over Kafka, whose request-reply is
  // single-response by design — see the Kafka spec.)
  @MessagePattern('stream')
  stream(@Payload() data: number[]): Observable<number> {
    return from(data ?? []);
  }

  // Event-based: fire-and-forget. Records receipt so a request-response query can prove it.
  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: Record<string, unknown>): void {
    this.eventLog.record('order.created', data);
  }

  // Reads back what the event handler recorded (request-response).
  @MessagePattern('events')
  events(): Array<{ pattern: string; payload: unknown }> {
    return this.eventLog.all();
  }
}
