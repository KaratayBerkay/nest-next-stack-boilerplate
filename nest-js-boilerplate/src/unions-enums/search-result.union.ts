import { createUnionType } from '@nestjs/graphql';
import { Article } from './models/article.model';
import { Video } from './models/video.model';

// A GraphQL union (docs.nestjs.com/graphql/unions-and-enums). Member object types are
// pulled into the schema automatically; resolveType maps each runtime value to its type.
export const SearchResult = createUnionType({
  name: 'SearchResult',
  types: () => [Article, Video] as const,
  resolveType(value: Article | Video) {
    return 'headline' in value ? Article : Video;
  },
});
