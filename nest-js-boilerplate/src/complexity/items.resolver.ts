import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import type { ComplexityEstimatorArgs } from '@nestjs/graphql';
import { Item } from './models/item.model';

@Resolver()
export class ItemsResolver {
  // Query-level cost is a function of the requested count: a big `count` makes the query
  // expensive enough to trip the ComplexityPlugin's budget before the resolver even runs.
  @Query(() => [Item], {
    name: 'items',
    complexity: (options: ComplexityEstimatorArgs) =>
      Number(options.args.count) * options.childComplexity,
  })
  items(@Args('count', { type: () => Int }) count: number): Item[] {
    return Array.from({ length: count }, (_v, i) => ({ name: `item-${i}` }));
  }
}
