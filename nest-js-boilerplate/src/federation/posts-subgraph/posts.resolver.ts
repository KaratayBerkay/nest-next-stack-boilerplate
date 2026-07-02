import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { User } from './user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'getPosts' })
  getPosts(): Post[] {
    return this.postsService.all();
  }

  // Returns only a User *reference* (the @key). The gateway hands this to the users subgraph's
  // @ResolveReference to fill in name/email — the heart of cross-subgraph entity resolution.
  @ResolveField(() => User, { name: 'user' })
  user(@Parent() post: Post): { __typename: 'User'; id: number } {
    return { __typename: 'User', id: post.authorId };
  }
}
