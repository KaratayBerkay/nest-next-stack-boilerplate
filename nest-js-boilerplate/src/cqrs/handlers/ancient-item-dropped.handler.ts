import { EventsHandler } from '@nestjs/cqrs';
import type { IEventHandler } from '@nestjs/cqrs';
import { GameEventLog } from '../game-event-log.service';
import { AncientItemDroppedEvent } from '../heroes.events';

/**
 * CQRS › Event handler (#113). Records the event emitted by the saga-triggered drop command —
 * proof the second leg of the chain (saga → command → aggregate event) actually fired.
 */
@EventsHandler(AncientItemDroppedEvent)
export class AncientItemDroppedHandler implements IEventHandler<AncientItemDroppedEvent> {
  constructor(private readonly log: GameEventLog) {}

  handle(event: AncientItemDroppedEvent): void {
    this.log.record('AncientItemDroppedEvent', {
      heroId: event.heroId,
      itemId: event.itemId,
    });
  }
}
