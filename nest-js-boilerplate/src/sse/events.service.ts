import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

/**
 * Shared event bus backing the SSE endpoint. Any provider can call `publish()` and the
 * event is pushed to every connected SSE client over its open `text/event-stream`.
 * Kept transport-agnostic (just RxJS) so non-HTTP code can fan events in too.
 */
@Injectable()
export class EventsService {
  private readonly events$ = new Subject<MessageEvent>();

  /** Push a server-side event to all connected SSE clients. */
  publish(data: string | object, type?: string): void {
    this.events$.next(type ? { data, type } : { data });
  }

  /** Live stream consumed by the `@Sse()` handler. */
  asObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }
}
