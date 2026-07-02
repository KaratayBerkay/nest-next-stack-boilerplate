import { Query, Resolver } from '@nestjs/graphql';
import { Media } from './models/media.model';
import { Movie } from './models/movie.model';
import { Podcast } from './models/podcast.model';

const MOVIES: Movie[] = [{ id: '1', title: 'Inception', durationMinutes: 148 }];
const PODCASTS: Podcast[] = [{ id: '2', title: 'Syntax', episodeCount: 700 }];

@Resolver()
export class MediaResolver {
  // Returns a heterogeneous list typed as the interface — resolveType picks the concrete
  // GraphQL type for each element so clients can use inline fragments.
  @Query(() => [Media], { name: 'mediaLibrary' })
  library(): Array<Movie | Podcast> {
    return [...MOVIES, ...PODCASTS];
  }

  // Concrete-typed queries: also pull Movie/Podcast directly into the schema (no need for
  // buildSchemaOptions.orphanedTypes) and let clients query their specific fields.
  @Query(() => [Movie], { name: 'movies' })
  movies(): Movie[] {
    return MOVIES;
  }

  @Query(() => [Podcast], { name: 'podcasts' })
  podcasts(): Podcast[] {
    return PODCASTS;
  }
}
