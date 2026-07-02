import { EventsHandler } from '@nestjs/cqrs';
import type { IEventHandler } from '@nestjs/cqrs';
import { GameEventLog } from '../game-event-log.service';
import { HeroKilledDragonEvent } from '../heroes.events';

/**
 * CQRS › Event handler (#113). Reacts to the kill event (fire-and-forget) by recording it.
 * Multiple handlers may subscribe to the same event; this one runs alongside the saga.
 */
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private readonly log: GameEventLog) {}

  handle(event: HeroKilledDragonEvent): void {
    this.log.record('HeroKilledDragonEvent', {
      heroId: event.heroId,
      dragonId: event.dragonId,
    });
  }
}
