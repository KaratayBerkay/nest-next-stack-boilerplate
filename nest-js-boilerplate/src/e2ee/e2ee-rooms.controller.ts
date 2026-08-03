import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { E2eeRoomsService } from './e2ee-rooms.service';
import { PublishSenderKeysDto } from './dto/publish-sender-keys.dto';

@ApiTags('E2EE Rooms')
@ApiBearerAuth()
@Controller('api/e2ee/rooms')
@UseInterceptors(LoggingInterceptor)
@UseGuards(SessionAuthGuard)
export class E2eeRoomsController {
  constructor(
    private readonly rooms: E2eeRoomsService,
    private readonly logger: Logger,
  ) {}

  @Post(':roomId/sender-keys')
  @ApiOperation({
    summary: 'Publish wrapped sender-key copies for a room epoch',
  })
  async publishSenderKeys(
    @Param('roomId') roomId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: PublishSenderKeysDto,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    if (!dto.keys || dto.keys.length === 0) {
      throw new BadRequestException('At least one wrapped key is required');
    }

    // senderDeviceId always comes from the authenticated session, never the
    // request body — otherwise any caller could publish (or pre-emptively
    // poison, via the unique-constraint skip-duplicate insert) sender-key
    // rows impersonating another member's device.
    const count = await this.rooms.publishSenderKeys(
      roomId,
      user.deviceId,
      dto.epoch,
      dto.keys.map((k) => ({
        recipientDeviceId: k.recipientDeviceId,
        wrappedKey: Buffer.from(k.wrappedKey, 'base64'),
        wrapNonce: Buffer.from(k.wrapNonce, 'base64'),
      })),
    );
    return { count };
  }

  @Get(':roomId/sender-keys')
  @ApiOperation({ summary: 'Fetch wrapped sender keys for the current device' })
  async fetchSenderKeys(
    @Param('roomId') roomId: string,
    @CurrentUser() user: JwtUser,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }

    const keys = await this.rooms.fetchSenderKeys(roomId, user.deviceId);
    return keys.map((k) => ({
      ...k,
      wrappedKey: Buffer.from(k.wrappedKey).toString('base64'),
      wrapNonce: Buffer.from(k.wrapNonce).toString('base64'),
    }));
  }

  @Get(':roomId/members')
  @ApiOperation({ summary: 'Get durable room membership list' })
  async getRoomMembers(@Param('roomId') roomId: string) {
    return this.rooms.getRoomMembers(roomId);
  }
}
