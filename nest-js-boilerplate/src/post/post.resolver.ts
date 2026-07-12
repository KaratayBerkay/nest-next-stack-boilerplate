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
  async author(@Parent() post: Post): Promise<User | null> {
    return this.dataloader.getUserLoader().load(post.authorId);
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

  @UseGuards(TierGuard)
  @MinTier(SubscriptionTier.MEDIUM)
  @ResolveField(() => [ReactionCount])
  reactionBreakdown(@Parent() post: Post): ReactionCount[] {
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

  @UseGuards(TierGuard)
  @MinTier(SubscriptionTier.PREMIUM)
  @ResolveField(() => [Reactor])
  whoReacted(@Parent() post: Post): Reactor[] {
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
