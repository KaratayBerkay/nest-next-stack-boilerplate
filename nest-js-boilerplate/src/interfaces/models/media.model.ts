// fallow-ignore-next-line circular-dependency — GraphQL interface/implementation cycle
import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Movie } from './movie.model';
import { Podcast } from './podcast.model';

// A GraphQL interface (docs.nestjs.com/graphql/interfaces). `resolveType` inspects the
// runtime value and tells GraphQL which concrete object type to use — here discriminated by
// a field unique to each implementer.
@InterfaceType({
  resolveType(value: Movie | Podcast) {
    return 'durationMinutes' in value ? Movie : Podcast;
  },
})
export abstract class Media {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;
}
