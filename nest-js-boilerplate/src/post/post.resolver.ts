import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  ID,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Post } from '../@generated/post/post.model';
import { User } from '../@generated/user/user.model';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { MinTier } from '../authorization/min-tier.decorator';
import { TierGuard } from '../authorization/tier.guard';
import { TIER_RANK } from '../authorization/tier-rank';
import { DataloaderService } from '../common/dataloader/dataloader.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostService } from './post.service';

type PostWithReactions = Post & {
  reactions?: {
    type: string;
    userId: string;
    user?: { name: string | null } | null;
  }[];
};

/** Same rank comparison TierGuard does — used directly here because guards
 *  never run for `@ResolveField()` methods under this app's GraphQL config
 *  (see reactionBreakdown's doc comment below). */
function meetsTier(
  userTier: string | undefined,
  required: SubscriptionTier,
): boolean {
  const userRank = TIER_RANK[userTier as SubscriptionTier] ?? -1;
  const requiredRank = TIER_RANK[required] ?? Infinity;
  return userRank >= requiredRank;
}

@ObjectType()
export class PostStats {
  @Field(() => Int)
  totalPosts!: number;

  @Field(() => Int)
  totalReactions!: number;

  @Field(() => Float)
  avgReactionsPerPost!: number;
}

@ObjectType()
export class ReactionCount {
  @Field()
  type!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class Reactor {
  @Field()
  userId!: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  type!: string;
}

@UseGuards(SessionAuthGuard)
@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly dataloader: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async author(
    @Parent() post: Post,
    @CurrentUser() viewer: JwtUser,
  ): Promise<User | null> {
    const author = await this.dataloader.getUserLoader().load(post.authorId);
    if (!author) return null;
    return author.hideAvatar && author.id !== viewer.userId
      ? { ...author, avatarUrl: null }
      : author;
  }

  @ResolveField(() => String, { nullable: true })
  coverImage(@Parent() post: Post): string | null {
    if (!post.coverImage) return null;
    const buf = post.coverImage as unknown as Buffer;
    return buf.toString('base64');
  }

  @ResolveField(() => String, { nullable: true })
  imageUrl(@Parent() post: Post): string | null {
    return post.imageUrl ?? null;
  }

  // `@UseGuards`/`@MinTier` do NOT gate this: GraphQLModule is configured with
  // `fieldResolverEnhancers: ['interceptors']` (see app.module.ts), so Nest
  // never runs guards for a `@ResolveField()` — decorated or not, class-level
  // or method-level (confirmed in @nestjs/graphql's resolvers-explorer.service
  // — `contextOptions.guards` is hard-false for property resolvers unless
  // 'guards' is in that list). A `@UseGuards(TierGuard)` here would silently
  // never run, handing every viewer the full breakdown regardless of tier.
  // The tier check has to be imperative, same pattern UserPrivacyResolver
  // uses for its own field-level redaction.
  @ResolveField(() => [ReactionCount])
  reactionBreakdown(
    @Parent() post: Post,
    @CurrentUser() viewer: JwtUser,
  ): ReactionCount[] {
    if (!meetsTier(viewer.tier, SubscriptionTier.MEDIUM)) return [];
    const reactions = (post as PostWithReactions).reactions ?? [];
    const counts = new Map<string, number>();
    for (const r of reactions) {
      counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }

  // Same field-resolver-guards-don't-run gap as reactionBreakdown above.
  @ResolveField(() => [Reactor])
  whoReacted(@Parent() post: Post, @CurrentUser() viewer: JwtUser): Reactor[] {
    if (!meetsTier(viewer.tier, SubscriptionTier.PREMIUM)) return [];
    const reactions = (post as PostWithReactions).reactions ?? [];
    return reactions.map((r) => ({
      userId: r.userId,
      name: r.user?.name ?? undefined,
      type: r.type,
    }));
  }

  @UseGuards(TierGuard)
  @MinTier(SubscriptionTier.MEDIUM)
  @Query(() => PostStats, { name: 'myPostStats' })
  async myPostStats(@CurrentUser() user: JwtUser): Promise<PostStats> {
    return this.postService.getMyPostStats(user.userId);
  }

  @Query(() => [Post])
  postList(
    @Args('cursor', { type: () => ID, nullable: true }) cursor?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.postService.findAll(cursor, take, search);
  }

  @Query(() => Post, { nullable: true })
  post(@Args('id', { type: () => ID }) id: string) {
    return this.postService.findOne(id);
  }

  @Mutation(() => Post)
  createPost(
    @CurrentUser() user: JwtUser,
    @Args('data') data: CreatePostInput,
  ) {
    return this.postService.create(user.userId, data, user.friends);
  }

  @Mutation(() => Post)
  updatePost(
    @CurrentUser() user: JwtUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdatePostInput,
  ) {
    return this.postService.update(id, user.userId, data);
  }

  @Mutation(() => Post)
  deletePost(
    @CurrentUser() user: JwtUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.postService.delete(id, user.userId);
  }
}
