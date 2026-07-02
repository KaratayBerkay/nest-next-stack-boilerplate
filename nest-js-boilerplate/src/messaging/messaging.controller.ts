import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from '../exception-filters/http-exception.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { MessagingService } from './messaging.service';
import { MessagingWsGateway } from './messaging-ws.gateway';
import { MarkReadInput } from './dto/mark-read.input';
import { SendMessageRestDto } from './dto/send-message-rest.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('api')
@UseFilters(HttpExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class MessagingController {
  constructor(
    private readonly jwt: JwtService,
    private readonly ms: MessagingService,
    private readonly wsGateway: MessagingWsGateway,
    private readonly logger: Logger,
  ) {}

  private extractToken(authHeader: string | undefined): string {
    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header');
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      throw new UnauthorizedException('Invalid Authorization header');
    return parts[1];
  }

  private async verify(token: string) {
    try {
      return await this.jwt.verifyAsync<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException();
    }
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
    @Headers('authorization') auth: string,
    @Query('q') q?: string,
  ): Promise<
    { id: string; email: string; name: string | null; avatar: string }[]
  > {
    const payload = await this.verify(this.extractToken(auth));
    const result = await this.ms.getFriends(payload.sub, q);
    this.logger.log(`Fetched ${result.length} friends`, 'MessagingController');
    return result;
  }

  @Get('friends/requests')
  @ApiOperation({ summary: 'List pending friend requests' })
  async getFriendRequests(@Headers('authorization') auth: string) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.getFriendRequests(payload.sub);
  }

  @Post('friends/request/:userId')
  @ApiOperation({ summary: 'Send a friend request' })
  async sendFriendRequest(
    @Headers('authorization') auth: string,
    @Param('userId') addresseeId: string,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.sendFriendRequest(payload.sub, addresseeId);
  }

  @Post('friends/accept/:userId')
  @ApiOperation({ summary: 'Accept a friend request' })
  async acceptFriendRequest(
    @Headers('authorization') auth: string,
    @Param('userId') requesterId: string,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.acceptFriendRequest(payload.sub, requesterId);
  }

  @Post('friends/decline/:userId')
  @ApiOperation({ summary: 'Decline a friend request' })
  async declineFriendRequest(
    @Headers('authorization') auth: string,
    @Param('userId') requesterId: string,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.declineFriendRequest(payload.sub, requesterId);
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'List conversations with latest message per friend',
  })
  async getConversations(@Headers('authorization') auth: string) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.getConversations(payload.sub);
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
    @Headers('authorization') auth: string,
    @Param('userId') otherUserId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    return this.ms.getMessages(
      payload.sub,
      otherUserId,
      before,
      take ? parseInt(take, 10) : 30,
    );
  }

  @Post('conversations/:userId/messages')
  @ApiOperation({ summary: 'Send a direct message' })
  async sendMessage(
    @Headers('authorization') auth: string,
    @Param('userId') recipientId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: SendMessageRestDto,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    const message = await this.ms.sendMessage(
      payload.sub,
      recipientId,
      body.text,
    );
    this.wsGateway.broadcastDirectMessage(recipientId, message);
    this.logger.log(
      `Message ${message.id} sent to ${recipientId}`,
      'MessagingController',
    );
    return message;
  }

  @Post('messages/read')
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  async markMessagesRead(
    @Headers('authorization') auth: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: MarkReadInput,
  ) {
    const payload = await this.verify(this.extractToken(auth));
    const result = await this.ms.markRead(payload.sub, body.userId);
    this.wsGateway.broadcastMessageRead(
      payload.sub,
      body.userId,
      result.readAt,
    );
    this.logger.log(
      `Messages from ${body.userId} marked as read`,
      'MessagingController',
    );
    return { ok: true, readAt: result.readAt };
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get paginated room messages' })
  @ApiQuery({ name: 'before', required: false })
  @ApiQuery({ name: 'take', required: false })
  async getRoomMessages(
    @Headers('authorization') auth: string,
    @Param('roomId') roomId: string,
    @Query('before') before?: string,
    @Query('take') take?: string,
  ) {
    await this.verify(this.extractToken(auth));
    return this.ms.getRoomMessages(
      roomId,
      before,
      take ? parseInt(take, 10) : 30,
    );
  }
}
