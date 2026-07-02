import { Query, Resolver } from '@nestjs/graphql';
import { Announcement } from './models/announcement.model';

@Resolver(() => Announcement)
export class AnnouncementsResolver {
  // Returns lowercase values; the @upper directive transforms `headline` on the way out,
  // while `body` (no directive) passes through unchanged.
  @Query(() => Announcement, { name: 'announcement' })
  announcement(): Announcement {
    return { headline: 'launch day', body: 'see you there' };
  }
}
