import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { MessagingService } from './messaging.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { MarkReadInput } from './dto/mark-read.input';
import { SendMessageRestDto } from './dto/send-message-rest.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { decryptMessageBody } from './message-body.util';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('api')
@UseInterceptors(LoggingInterceptor)
@UseGuards(SessionAuthGuard)
export class MessagingController {
  constructor(
    private readonly ms: MessagingService,
    private readonly realtime: RealtimeGateway,
    private readonly push: PushNotificationService,
    private readonly logger: Logger,
    private readonly storageCrypto: StorageCryptoService,
  ) {}

  @Get('messages/unread-count')
  @ApiOperation({ summary: 'Get total unread DM count across all peers' })
  async getUnreadCount(@CurrentUser() user: JwtUser) {
    const count = await this.ms.getTotalUnreadCount(user.userId);
    return { count };
  }

  // --- Friends ---

  @Get('friends')
  @ApiOperation({
    summary: 'List friends',
    description: 'Returns accepted friends for the authenticated user',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Optional search query',
  })
  async getFriends(
    @CurrentUser() user: JwtUser,
    @Query('q') q?: string,
  ): Promise<
    {
      id: string;
      email: string;
      name: string | null;
      avatar: string;
      online: boolean;
    }[]
  > {
    const result = await this.ms.getFriends(user.userId, q);
    const onlineUserIds = new Set(this.realtime.getOnlineUserIds());
    this.logger.log(
      `Fetched ${result.length} friends`,
      MessagingController.name,
    );
    return result.map((f) => ({ ...f, online: onlineUserIds.has(f.id) }));
  }

  @Get('friends/requests')
  @ApiOperation({ summary: 'List pending friend requests' })
  async getFriendRequests(@CurrentUser() user: JwtUser) {
    return this.ms.getFriendRequests(user.userId);
  }

  @Post('friends/request/:userId')
  @ApiOperation({ summary: 'Send a friend request' })
  async sendFriendRequest(
    @CurrentUser() user: JwtUser,
    @Param('userId') addresseeId: string,
  ) {
    const result = await this.ms.sendFriendRequest(user.userId, addresseeId);
    // Pending-list renew for both parties. Service-scoped (not emitToPage):
    // page-scoping only reaches sockets claiming the "friend-request" page,
    // so a user sitting on /messages never sees the frame — the exact bug
    // this replaced. Every client registers for the MESSAGE service, and
    // dispatchRenew's "Friends" case invalidates the list regardless of page.
    this.realtime.emitToService(user.userId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    this.realtime.emitToService(addresseeId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    return result;
  }

  @Post('friends/accept/:userId')
  @ApiOperation({ summary: 'Accept a friend request' })
  async acceptFriendRequest(
    @CurrentUser() user: JwtUser,
    @Param('userId') requesterId: string,
  ) {
    const result = await this.ms.acceptFriendRequest(user.userId, requesterId);
    this.realtime.emitToService(user.userId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    this.realtime.emitToService(requesterId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    return result;
  }

  @Post('friends/decline/:userId')
  @ApiOperation({ summary: 'Decline a friend request' })
  async declineFriendRequest(
    @CurrentUser() user: JwtUser,
    @Param('userId') requesterId: string,
  ) {
    const result = await this.ms.declineFriendRequest(user.userId, requesterId);
    this.realtime.emitToService(user.userId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    this.realtime.emitToService(requesterId, 'MESSAGE', {
      renew: 'Friends',
      type: 'PendingList',
    });
    return result;
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'List conversations with latest message per friend',
  })
  async getConversations(@CurrentUser() user: JwtUser) {
    const conversations = await this.ms.getConversations(user.userId);
    const onlineUserIds = new Set(this.realtime.getOnlineUserIds());
    return conversations.map((c) => ({
      ...c,
      user: { ...c.user, online: onlineUserIds.has(c.user.id) },
    }));
  }

  @Get('conversations/:userId/messages')
  @ApiOperation({ summary: 'Get paginated messages for a conversation' })
  @ApiQuery({
    name: 'before',
    required: false,
    description: 'Cursor for pagination (ISO timestamp)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Page size (default 30)',
  })
  async getMessages(
    @CurrentUser() user: JwtUser,
    @Param('userId') otherUserId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
  ) {
    const result = await this.ms.getMessages(
      user.userId,
      otherUserId,
      before,
      take ? Math.min(parseInt(take, 10), 100) : 30,
    );
    return {
      ...result,
      messages: result.messages.map((m) =>
        decryptMessageBody(m, user.userId, this.storageCrypto),
      ),
    };
  }

  @Get('conversations/:userId/attachments')
  @ApiOperation({
    summary: 'List every attachment exchanged in a conversation, newest first',
  })
  @ApiQuery({
    name: 'before',
    required: false,
    description: 'Cursor for pagination (ISO timestamp)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Page size (default 30)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive filter on attachment file name',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Only attachments at/after this timestamp (ISO)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Only attachments at/before this timestamp (ISO)',
  })
  async getConversationAttachments(
    @CurrentUser() user: JwtUser,
    @Param('userId') otherUserId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ms.getConversationAttachments(
      user.userId,
      otherUserId,
      before,
      take ? Math.min(parseInt(take, 10), 100) : 30,
      search,
      from,
      to,
    );
  }

  @Post('conversations/:userId/messages')
  @ApiOperation({ summary: 'Send a direct message' })
  async sendMessage(
    @CurrentUser() user: JwtUser,
    @Param('userId') recipientId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: SendMessageRestDto,
  ) {
    // Client E2EE envelope passes through; when absent the service encrypts
    // the plaintext for at-rest storage itself (never plaintext).
    return this.ms.sendAndDeliverMessage(
      user.userId,
      recipientId,
      body.text,
      body._tempId,
      body.attachments,
      body.envelope,
      { text: body.text, attachments: body.attachments },
      body.replyToId,
    );
  }

  @Post('messages/:messageId/delete-for-me')
  @ApiOperation({
    summary: 'Hide a message for the current user only',
    description:
      'Server-persisted — stays hidden across reloads and this user’s other devices. Never visible to or affects the peer.',
  })
  async deleteMessageForMe(
    @CurrentUser() user: JwtUser,
    @Param('messageId') messageId: string,
  ) {
    return this.ms.deleteMessageForMe(user.userId, messageId);
  }

  @Post('messages/:messageId/delete-for-everyone')
  @ApiOperation({
    summary: 'Tombstone a message for both parties',
    description:
      'Sender-only, within the delete-for-everyone window. Soft-hide: ciphertext and attachments are left at rest, just excluded from API responses.',
  })
  async deleteMessageForEveryone(
    @CurrentUser() user: JwtUser,
    @Param('messageId') messageId: string,
  ) {
    return this.ms.deleteMessageForEveryone(user.userId, messageId);
  }

  @Post('messages/read')
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  async markMessagesRead(
    @CurrentUser() user: JwtUser,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: MarkReadInput,
  ) {
    const result = await this.ms.markConversationRead(user.userId, body.userId);
    this.logger.log(
      `Messages from ${body.userId} marked as read`,
      MessagingController.name,
    );
    return { ok: true, readAt: result.readAt };
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List available chat rooms' })
  async getRooms() {
    return this.ms.rooms.listRooms();
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get paginated room messages' })
  @ApiQuery({ name: 'before', required: false })
  @ApiQuery({ name: 'take', required: false })
  async getRoomMessages(
    @CurrentUser() user: JwtUser,
    @Param('roomId') roomId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
  ) {
    const result = await this.ms.getRoomMessages(
      roomId,
      user.tier,
      before,
      take ? Math.min(parseInt(take, 10), 100) : 30,
    );
    return {
      ...result,
      messages: result.messages.map((m: Record<string, unknown>) =>
        decryptMessageBody(m, user.userId, this.storageCrypto),
      ),
    };
  }

  @Get('rooms/:roomId/attachments')
  @ApiOperation({
    summary: 'List every attachment ever shared in a room, newest first',
  })
  @ApiQuery({
    name: 'before',
    required: false,
    description: 'Cursor for pagination (ISO timestamp)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Page size (default 30)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive filter on attachment file name',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Only attachments at/after this timestamp (ISO)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Only attachments at/before this timestamp (ISO)',
  })
  async getRoomAttachments(
    @CurrentUser() user: JwtUser,
    @Param('roomId') roomId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ms.getRoomAttachments(
      roomId,
      user.tier,
      before,
      take ? Math.min(parseInt(take, 10), 100) : 30,
      search,
      from,
      to,
    );
  }
}
