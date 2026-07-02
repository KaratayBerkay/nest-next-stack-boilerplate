import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GameEventLog } from './game-event-log.service';
import type { LoggedEvent } from './game-event-log.service';
import { KillDragonCommand } from './heroes.commands';
import { GetHeroQuery } from './heroes.queries';
import type { HeroView } from './hero.model';

/**
 * HTTP front door for the CQRS heroes domain — drives the buses so the whole flow is provable
 * over the wire. The controller knows only the two buses: it dispatches a command (write) and a
 * query (read), and never touches handlers, the aggregate, or the saga directly.
 */
@Controller('cqrs')
export class HeroesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventLog: GameEventLog,
  ) {}

  // Write side. execute() infers { actionId } from KillDragonCommand extends Command<...>.
  @Post('heroes/:id/kill')
  async kill(
    @Param('id') id: string,
    @Body('dragonId') dragonId: string,
  ): Promise<{ actionId: string }> {
    return this.commandBus.execute(new KillDragonCommand(id, dragonId));
  }

  // Read side.
  @Get('heroes/:id')
  async getHero(@Param('id') id: string): Promise<HeroView> {
    return this.queryBus.execute(new GetHeroQuery(id));
  }

  // Read-back of every handled domain event (proves EventBus delivery).
  @Get('events')
  events(): LoggedEvent[] {
    return this.eventLog.all();
  }
}
