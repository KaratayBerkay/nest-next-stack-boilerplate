/**
 * CQRS › Events (#113). Plain, serializable value objects describing something that *happened*.
 * Events carry no behaviour — handlers and sagas react to them. `HeroKilledDragonEvent` is also
 * the trigger the saga listens for; `AncientItemDroppedEvent` is applied by the follow-up command.
 */
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}

export class AncientItemDroppedEvent {
  constructor(
    public readonly heroId: string,
    public readonly itemId: string,
  ) {}
}
