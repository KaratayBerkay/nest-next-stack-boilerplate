import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { Message } from '../@generated/message/message.model';
import { User } from '../@generated/user/user.model';
import { MessagingService } from './messaging.service';
import { Conversation } from './models/conversation.model';
import { SendMessageInput } from './dto/send-message.input';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';

@UseGuards(SessionAuthGuard)
@Resolver()
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
    return messages.map((m) => this.decryptMessageBody(m, user.userId));
  }

  @Mutation(() => Message)
  async sendMessage(
    @CurrentUser() user: JwtUser,
    @Args('input') input: SendMessageInput,
  ) {
    const attachment =
      input.attachmentUrl && input.attachmentType && input.attachmentName
        ? {
            url: input.attachmentUrl,
            type: input.attachmentType,
            name: input.attachmentName,
            storageEnvelope: input.attachmentEnvelope as { v: string; nonce: string; ct: string } | null | undefined,
          }
        : undefined;

    const storageEnvelope = input.envelope
      ? input.envelope
      : input.text || attachment
        ? await this.storageCrypto.encryptForStorage(user.userId, {
            text: input.text,
            attachment,
          })
        : undefined;

    return this.ms.sendAndDeliverMessage(
      user.userId,
      input.recipientId,
      input.text,
      undefined,
      attachment,
      storageEnvelope as Record<string, unknown> | undefined,
    );
  }

  @Mutation(() => Boolean)
  async markMessagesRead(
    @CurrentUser() user: JwtUser,
    @Args('userId') otherUserId: string,
  ) {
    await this.ms.markConversationRead(user.userId, otherUserId);
    return true;
  }

  private decryptMessageBody(
    message: Record<string, unknown>,
    userId: string,
  ): Record<string, unknown> {
    if (message.encrypted && message.envelope && !message.body) {
      try {
        const decrypted = this.storageCrypto.decryptFromStorage(
          userId,
          message.envelope,
        ) as { text?: string; attachment?: unknown };
        return { ...message, body: decrypted.text ?? '', envelope: undefined };
      } catch {
        return message;
      }
    }
    return message;
  }
}
