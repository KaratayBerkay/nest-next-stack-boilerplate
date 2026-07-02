import { AggregateRoot } from '@nestjs/cqrs';
import {
  AncientItemDroppedEvent,
  HeroKilledDragonEvent,
} from './heroes.events';

/** Read model returned by queries — the aggregate's state, without its behaviour. */
export interface HeroView {
  id: string;
  kills: string[];
  items: string[];
}

/**
 * CQRS › Aggregate Root (#113). `Hero` is the write model. Behaviour methods don't mutate state
 * directly — they `apply()` a domain event. `apply()` does two things: (1) queues the event for
 * publication on `commit()` (once the publisher context is merged in by a handler), and (2)
 * dispatches to the matching `on<EventClassName>` method below, which performs the actual state
 * transition. That second step is event sourcing: state is derived purely from applied events.
 *
 * A `Hero` is reconstructed fresh from stored state on every load (see HeroRepository) — never
 * shared — so its uncommitted-event buffer starts empty each command. That matters: a saga
 * dispatches its follow-up command *synchronously* inside the originating `commit()`, before the
 * buffer is cleared; reusing a live instance would re-publish the in-flight event and loop.
 */
export class Hero extends AggregateRoot {
  private readonly kills: string[];
  private readonly items: string[];

  constructor(
    public readonly id: string,
    state?: Partial<Pick<HeroView, 'kills' | 'items'>>,
  ) {
    super();
    this.kills = [...(state?.kills ?? [])];
    this.items = [...(state?.items ?? [])];
  }

  killEnemy(dragonId: string): void {
    this.apply(new HeroKilledDragonEvent(this.id, dragonId));
  }

  dropItem(itemId: string): void {
    this.apply(new AncientItemDroppedEvent(this.id, itemId));
  }

  // Event-sourced state transitions, invoked by AggregateRoot.apply() via name convention.
  onHeroKilledDragonEvent(event: HeroKilledDragonEvent): void {
    this.kills.push(event.dragonId);
  }

  onAncientItemDroppedEvent(event: AncientItemDroppedEvent): void {
    this.items.push(event.itemId);
  }

  toView(): HeroView {
    return { id: this.id, kills: [...this.kills], items: [...this.items] };
  }
}
