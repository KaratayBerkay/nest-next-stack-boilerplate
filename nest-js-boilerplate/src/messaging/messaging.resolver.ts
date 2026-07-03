import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { Message } from '../@generated/message/message.model';
import { User } from '../@generated/user/user.model';
import { MessagingService } from './messaging.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Conversation } from './models/conversation.model';
import { SendMessageInput } from './dto/send-message.input';

@UseGuards(SessionAuthGuard)
@Resolver()
export class MessagingResolver {
  constructor(
    private readonly ms: MessagingService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Query(() => [User])
  async users(
    @CurrentUser() user: JwtUser,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.ms.getUsers(user.userId, search);
  }

  @Query(() => [Conversation])
  async conversations(@CurrentUser() user: JwtUser) {
    return this.ms.getConversations(user.userId);
  }

  @Query(() => [Message])
  async conversationMessages(
    @CurrentUser() user: JwtUser,
    @Args('userId') otherUserId: string,
  ) {
    return this.ms.getMessages(user.userId, otherUserId);
  }

  @Mutation(() => Message)
  async sendMessage(
    @CurrentUser() user: JwtUser,
    @Args('input') input: SendMessageInput,
  ) {
    return this.ms.sendMessage(
      user.userId,
      input.recipientId,
      input.text,
      user.friends,
    );
  }

  @Mutation(() => Boolean)
  async markMessagesRead(
    @CurrentUser() user: JwtUser,
    @Args('userId') otherUserId: string,
  ) {
    const result = await this.ms.markRead(user.userId, otherUserId);
    this.realtime.emitToUser(user.userId, {
      type: 'message-read',
      readerId: user.userId,
      senderId: otherUserId,
      readAt: result.readAt,
    });
    this.realtime.emitToUser(otherUserId, {
      type: 'message-read',
      readerId: user.userId,
      senderId: otherUserId,
      readAt: result.readAt,
    });
    return true;
  }
}
