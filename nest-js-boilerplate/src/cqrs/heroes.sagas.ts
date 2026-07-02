import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import type { ICommand, IEvent } from '@nestjs/cqrs';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { DropAncientItemCommand } from './heroes.commands';
import { HeroKilledDragonEvent } from './heroes.events';

/**
 * CQRS › Sagas (#113). A saga is a long-lived RxJS pipeline that maps a stream of *events* to a
 * stream of *commands*; the framework subscribes to the returned stream and dispatches whatever
 * commands it emits. Here, every dragon kill automatically drops an ancient item — the model of
 * a process reacting to events without the originating handler knowing about it. `ofType` filters
 * the event stream to a concrete class (and narrows the type for the `map` below).
 */
@Injectable()
export class HeroesSagas {
  @Saga()
  dragonKilled = (events$: Observable<IEvent>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map(
        (event) =>
          new DropAncientItemCommand(event.heroId, `ancient-${event.dragonId}`),
      ),
    );
  };
}
