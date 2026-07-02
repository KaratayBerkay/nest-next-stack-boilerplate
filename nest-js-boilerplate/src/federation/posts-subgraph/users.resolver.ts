import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { User } from './user.entity';

// Resolves the `posts` field this subgraph contributes to the shared User entity. The `@Parent`
// User is the reference the gateway sends ({ __typename: 'User', id }); we just need its id.
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => [Post], { name: 'posts' })
  posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}
