import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { Message } from '../@generated/message/message.model';
import { User } from '../@generated/user/user.model';
import { MessagingService } from './messaging.service';
import { Conversation } from './models/conversation.model';
import { SendMessageInput } from './dto/send-message.input';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { decryptMessageBody } from './message-body.util';

@UseGuards(SessionAuthGuard)
@Resolver(() => Message)
export class MessagingResolver {
  constructor(
    private readonly ms: MessagingService,
    private readonly storageCrypto: StorageCryptoService,
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
    const { messages } = await this.ms.getMessages(user.userId, otherUserId);
    return messages;
  }

  @Mutation(() => Message)
  async sendMessage(
    @CurrentUser() user: JwtUser,
    @Args('input') input: SendMessageInput,
  ) {
    // Client E2EE envelope passes through; when absent the service encrypts
    // the plaintext for at-rest storage itself (never plaintext).
    const result = await this.ms.sendAndDeliverMessage(
      user.userId,
      input.recipientId,
      input.text,
      undefined,
      input.attachments,
      input.envelope,
      { text: input.text, attachments: input.attachments },
    );
    // sendAndDeliverMessage resolves { message, delivery } — only `message`
    // is the actual Message-shaped row this mutation declares as its return
    // type; `delivery` is the WS payload, irrelevant to the GraphQL caller.
    return result.message;
  }

  @Mutation(() => Boolean)
  async markMessagesRead(
    @CurrentUser() user: JwtUser,
    @Args('userId') otherUserId: string,
  ) {
    await this.ms.markConversationRead(user.userId, otherUserId);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteMessageForMe(
    @CurrentUser() user: JwtUser,
    @Args('messageId') messageId: string,
  ) {
    await this.ms.deleteMessageForMe(user.userId, messageId);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteMessageForEveryone(
    @CurrentUser() user: JwtUser,
    @Args('messageId') messageId: string,
  ) {
    await this.ms.deleteMessageForEveryone(user.userId, messageId);
    return true;
  }

  // `body` is decrypted at read time from the v/ct/nonce columns, never
  // stored in plaintext, so it isn't a real column on the generated Message
  // model — it has to be resolved as a computed field rather than a plain
  // @Field(), the same pattern used for Report.summary (see
  // graphql-other/reports.resolver.ts).
  @ResolveField(() => String, { nullable: true })
  body(
    @Parent() message: Message,
    @CurrentUser() user: JwtUser,
  ): string | null {
    const decrypted = decryptMessageBody(
      message as unknown as Record<string, unknown>,
      user.userId,
      this.storageCrypto,
    );
    return (decrypted.body as string | null) ?? null;
  }
}
