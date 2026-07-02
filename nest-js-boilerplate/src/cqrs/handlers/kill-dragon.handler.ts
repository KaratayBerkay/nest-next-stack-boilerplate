import { randomUUID } from 'node:crypto';
import { CommandHandler, EventPublisher } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from '../heroes.commands';
import { HeroRepository } from '../hero.repository';

/**
 * CQRS › Command handler + Aggregate publishing (#113). `mergeObjectContext` injects the
 * EventPublisher into the loaded aggregate so that `commit()` flushes its queued events onto the
 * EventBus. The return type is inferred from `KillDragonCommand extends Command<{ actionId }>`.
 */
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
  ) {}

  execute(command: KillDragonCommand): Promise<{ actionId: string }> {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      this.repository.findOneById(heroId),
    );
    hero.killEnemy(dragonId);
    this.repository.persist(hero);
    hero.commit(); // publishes HeroKilledDragonEvent → EventBus (handlers + sagas)
    return Promise.resolve({ actionId: randomUUID() });
  }
}
