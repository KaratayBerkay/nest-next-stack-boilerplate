import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable, interval, map, merge } from 'rxjs';
import { EventsService } from './events.service';

@Controller('sse')
export class SseController {
  constructor(private readonly events: EventsService) {}

  /**
   * Long-lived Server-Sent Events stream (GET /sse/stream). Merges server-pushed events
   * with a periodic heartbeat so proxies don't drop an otherwise-idle connection. Nest
   * unsubscribes the returned Observable automatically when the client disconnects, which
   * tears down the per-client heartbeat interval.
   */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    const heartbeat = interval(15_000).pipe(
      map(
        (): MessageEvent => ({
          data: { ping: Date.now() },
          type: 'heartbeat',
        }),
      ),
    );
    return merge(this.events.asObservable(), heartbeat);
  }

  /** Demo trigger: publishes an event from the server side onto the SSE stream. */
  @Post('publish')
  publish(@Body() body: { message: string }): { ok: true } {
    this.events.publish({ message: body.message });
    return { ok: true };
  }
}
