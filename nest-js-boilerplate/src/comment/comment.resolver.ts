import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Comment } from '../@generated/comment/comment.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Query(() => [Comment])
  postComments(@Args('postId', { type: () => ID }) postId: string) {
    return this.commentService.findByPost(postId);
  }

  @Mutation(() => Comment)
  createComment(
    @CurrentUser() user: JwtUser,
    @Args('data') data: CreateCommentInput,
  ) {
    return this.commentService.create(user.userId, data);
  }

  @Mutation(() => Comment)
  updateComment(
    @CurrentUser() user: JwtUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateCommentInput,
  ) {
    return this.commentService.update(id, user.userId, data);
  }

  @Mutation(() => Comment)
  deleteComment(
    @CurrentUser() user: JwtUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.commentService.delete(id, user.userId);
  }
}
