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
    // Client E2EE envelope passes through; when absent the service encrypts
    // the plaintext for at-rest storage itself (never plaintext).
    return this.ms.sendAndDeliverMessage(
      user.userId,
      input.recipientId,
      input.text,
      undefined,
      input.attachments,
      input.envelope,
      { text: input.text, attachments: input.attachments },
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
    const envelope = this.storageCrypto.toEnvelope(
      message as {
        v: string | null;
        ct: string | null;
        nonce: string | null;
      },
    );
    if (!envelope) return message;
    const { v: _v, ct: _ct, nonce: _nonce, ...rest } = message;
    const attempt = (
      decrypt: (e: unknown) => unknown,
    ): Record<string, unknown> | null => {
      try {
        const decrypted = decrypt(envelope) as {
          text?: string;
          attachments?: unknown;
        };
        return { ...rest, body: decrypted.text ?? '' };
      } catch {
        return null;
      }
    };
    return (
      attempt((e) => this.storageCrypto.decryptForRoom(e)) ??
      attempt((e) =>
        this.storageCrypto.decryptFromStorage(
          (message.senderId as string) || userId,
          e,
        ),
      ) ??
      attempt((e) => this.storageCrypto.decryptFromStorage(userId, e)) ??
      message
    );
  }
}
