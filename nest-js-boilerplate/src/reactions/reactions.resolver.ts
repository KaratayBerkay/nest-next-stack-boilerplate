import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reaction } from '../@generated/reaction/reaction.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateReactionInput } from './dto/create-reaction.input';
import { ReactionsService } from './reactions.service';

// Exercises GraphQL through FK depth (Reaction -> Post -> User) behind the JWT guard.
@UseGuards(SessionAuthGuard)
@Resolver(() => Reaction)
export class ReactionsResolver {
  constructor(private readonly reactions: ReactionsService) {}

  @Query(() => [Reaction], { name: 'reactions' })
  findByTarget(
    @Args('postId', { type: () => ID, nullable: true }) postId?: string,
    @Args('commentId', { type: () => ID, nullable: true }) commentId?: string,
  ) {
    return this.reactions.findByTarget(postId, commentId);
  }

  @Mutation(() => Reaction)
  createReaction(
    @CurrentUser() user: JwtUser,
    @Args('data') data: CreateReactionInput,
  ) {
    return this.reactions.create(user.userId, data);
  }
}
