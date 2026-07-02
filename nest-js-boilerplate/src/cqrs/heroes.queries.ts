import { Query } from '@nestjs/cqrs';
import type { HeroView } from './hero.model';

/**
 * CQRS › Queries (#113). A query is a request for data with no side effects. Extending
 * `Query<HeroView>` lets `queryBus.execute(new GetHeroQuery(id))` infer the `HeroView` result.
 */
export class GetHeroQuery extends Query<HeroView> {
  constructor(public readonly heroId: string) {
    super();
  }
}
