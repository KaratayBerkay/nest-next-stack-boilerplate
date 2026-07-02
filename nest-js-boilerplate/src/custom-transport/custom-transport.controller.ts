import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { NEVER, Observable } from 'rxjs';
import { EventStore } from './event-store.service';
import { InMemoryContext } from './in-memory.context';

interface SumPayload {
  values: number[];
}

interface UserCreatedEvent {
  id: number;
  name: string;
}

/**
 * custom transporter (#81) — ordinary microservice handlers. Nothing here is transport-aware:
 * the exact same `@MessagePattern`/`@EventPattern` decorators used over TCP/Redis/etc. are
 * discovered by Nest and registered into our {@link InMemoryServer} strategy at bootstrap, proving
 * a custom transport is a drop-in for the built-ins.
 */
@Controller()
export class CustomTransportController {
  constructor(private readonly events: EventStore) {}

  @MessagePattern('echo')
  echo(@Payload() data: unknown): unknown {
    return data;
  }

  @MessagePattern('sum')
  sum(@Payload() data: SumPayload): number {
    return data.values.reduce((acc, n) => acc + n, 0);
  }

  /**
   * Never emits — used to prove the client's teardown fires when a subscription is unsubscribed
   * early (e.g. a `timeout()` trips before any response arrives). `NEVER` holds no timer, so it
   * leaves no open handle behind.
   */
  @MessagePattern('slow')
  slow(): Observable<never> {
    return NEVER;
  }

  @EventPattern('user.created')
  onUserCreated(
    @Payload() data: UserCreatedEvent,
    @Ctx() ctx: InMemoryContext,
  ): void {
    this.events.record(ctx.getPattern(), data);
  }
}
