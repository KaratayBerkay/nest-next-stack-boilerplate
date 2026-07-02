import { Args, Query, Resolver } from '@nestjs/graphql';
import { Article } from './models/article.model';
import { Video } from './models/video.model';
import { ResultCategory } from './result-category.enum';
import { SearchResult } from './search-result.union';

const RESULTS: Array<Article | Video> = [
  { headline: 'Markets rally', category: ResultCategory.NEWS },
  {
    title: 'Funny cats',
    durationSeconds: 200,
    category: ResultCategory.ENTERTAINMENT,
  },
];

@Resolver()
export class SearchResolver {
  // Returns the union; the optional enum arg proves an enum works as an input type, while
  // the `category` field on each member proves it works as an output type.
  @Query(() => [SearchResult], { name: 'search' })
  search(
    @Args('category', { type: () => ResultCategory, nullable: true })
    category?: ResultCategory,
  ): Array<typeof SearchResult> {
    const items = category
      ? RESULTS.filter((r) => r.category === category)
      : RESULTS;
    return items;
  }
}
