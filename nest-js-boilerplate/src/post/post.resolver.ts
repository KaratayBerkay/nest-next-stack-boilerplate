import { UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Post } from '../@generated/post/post.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostService } from './post.service';

@UseGuards(SessionAuthGuard)
@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

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
