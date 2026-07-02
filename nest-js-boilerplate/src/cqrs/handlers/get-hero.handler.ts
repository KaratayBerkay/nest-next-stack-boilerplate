import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetHeroQuery } from '../heroes.queries';
import { HeroRepository } from '../hero.repository';
import type { HeroView } from '../hero.model';

/**
 * CQRS › Query handler (#113). The read side: returns the aggregate's projected state. Result
 * type (`HeroView`) is inferred from `GetHeroQuery extends Query<HeroView>`.
 */
@QueryHandler(GetHeroQuery)
export class GetHeroHandler implements IQueryHandler<GetHeroQuery> {
  constructor(private readonly repository: HeroRepository) {}

  execute(query: GetHeroQuery): Promise<HeroView> {
    return Promise.resolve(this.repository.findOneById(query.heroId).toView());
  }
}
