import { Command } from '@nestjs/cqrs';

/**
 * CQRS › Commands (#113). A command is an intent to change state. Extending `Command<R>` records
 * the handler's result type, so `commandBus.execute(new KillDragonCommand(...))` infers `R`
 * ({ actionId }) with no manual generics. `DropAncientItemCommand` returns nothing (`void`) and
 * is dispatched automatically by the saga, never by a controller.
 */
export class KillDragonCommand extends Command<{ actionId: string }> {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {
    super();
  }
}

export class DropAncientItemCommand extends Command<void> {
  constructor(
    public readonly heroId: string,
    public readonly itemId: string,
  ) {
    super();
  }
}
