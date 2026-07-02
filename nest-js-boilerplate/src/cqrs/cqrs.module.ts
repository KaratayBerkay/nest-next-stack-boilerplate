import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GameEventLog } from './game-event-log.service';
import { AncientItemDroppedHandler } from './handlers/ancient-item-dropped.handler';
import { DropAncientItemHandler } from './handlers/drop-ancient-item.handler';
import { GetHeroHandler } from './handlers/get-hero.handler';
import { HeroKilledDragonHandler } from './handlers/hero-killed-dragon.handler';
import { KillDragonHandler } from './handlers/kill-dragon.handler';
import { HeroRepository } from './hero.repository';
import { HeroesController } from './heroes.controller';
import { HeroesSagas } from './heroes.sagas';

const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
const QueryHandlers = [GetHeroHandler];
const EventHandlers = [HeroKilledDragonHandler, AncientItemDroppedHandler];

/**
 * CQRS › Overview (#113). `CqrsModule.forRoot()` registers the CommandBus, QueryBus, EventBus and
 * the explorer that auto-binds every `@CommandHandler` / `@QueryHandler` / `@EventsHandler` /
 * `@Saga()` declared as a provider here. One self-contained "heroes game" module exercises all
 * five pieces end-to-end: commands, queries, events, an aggregate root, and a saga.
 */
@Module({
  imports: [CqrsModule.forRoot()],
  controllers: [HeroesController],
  providers: [
    HeroRepository,
    GameEventLog,
    HeroesSagas,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CqrsExampleModule {}
