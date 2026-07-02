import { Injectable } from '@nestjs/common';

/**
 * Singleton store that makes fire-and-forget `@EventPattern` handlers observable: the event
 * handler writes here, and a separate `@MessagePattern` reads it back over request-response,
 * so an e2e can prove the event was actually delivered (an `emit()` returns no value itself).
 */
@Injectable()
export class EventLogService {
  private readonly events: Array<{ pattern: string; payload: unknown }> = [];

  record(pattern: string, payload: unknown): void {
    this.events.push({ pattern, payload });
  }

  all(): Array<{ pattern: string; payload: unknown }> {
    return [...this.events];
  }
}
