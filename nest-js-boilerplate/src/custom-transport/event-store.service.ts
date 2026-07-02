import { Injectable } from '@nestjs/common';

export interface RecordedEvent {
  pattern: string;
  data: unknown;
}

/**
 * custom transporter (#81) — a trivial sink so the proof test can observe that an `@EventPattern`
 * handler actually ran (events have no response channel to assert on).
 */
@Injectable()
export class EventStore {
  private readonly events: RecordedEvent[] = [];

  record(pattern: string, data: unknown): void {
    this.events.push({ pattern, data });
  }

  get all(): ReadonlyArray<RecordedEvent> {
    return this.events;
  }
}
