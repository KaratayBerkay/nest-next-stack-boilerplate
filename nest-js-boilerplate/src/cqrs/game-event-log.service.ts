import { Injectable } from '@nestjs/common';

export interface LoggedEvent {
  type: string;
  payload: Record<string, unknown>;
}

/**
 * Side-channel that records every domain event an `@EventsHandler` observed. Because event
 * handling is fire-and-forget, this log is what makes EventBus delivery provable: the e2e reads
 * it back over HTTP to confirm each handler actually ran.
 */
@Injectable()
export class GameEventLog {
  private readonly events: LoggedEvent[] = [];

  record(type: string, payload: Record<string, unknown>): void {
    this.events.push({ type, payload });
  }

  all(): LoggedEvent[] {
    return [...this.events];
  }
}
