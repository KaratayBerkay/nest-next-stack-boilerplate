import { CommandHandler, EventPublisher } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { DropAncientItemCommand } from '../heroes.commands';
import { HeroRepository } from '../hero.repository';

/**
 * CQRS › Command handler (#113). Dispatched by the saga (never directly by a controller) in
 * reaction to a kill. Applies an `AncientItemDroppedEvent` and commits it, closing the loop:
 * command → event → saga → command → event.
 */
@CommandHandler(DropAncientItemCommand)
export class DropAncientItemHandler implements ICommandHandler<DropAncientItemCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
  ) {}

  execute(command: DropAncientItemCommand): Promise<void> {
    const hero = this.publisher.mergeObjectContext(
      this.repository.findOneById(command.heroId),
    );
    hero.dropItem(command.itemId);
    this.repository.persist(hero);
    hero.commit();
    return Promise.resolve();
  }
}
