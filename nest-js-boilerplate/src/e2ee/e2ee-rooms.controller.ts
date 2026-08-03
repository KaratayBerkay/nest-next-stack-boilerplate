import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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

class PublishSenderKeysDto {
  senderDeviceId!: string;
  epoch!: number;
  keys!: Array<{
    recipientDeviceId: string;
    wrappedKey: string;
    wrapNonce: string;
  }>;
}

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
  @ApiOperation({ summary: 'Publish wrapped sender-key copies for a room epoch' })
  async publishSenderKeys(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: PublishSenderKeysDto,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    if (!dto.keys || dto.keys.length === 0) {
      throw new BadRequestException('At least one wrapped key is required');
    }

    const count = await this.rooms.publishSenderKeys(
      roomId,
      dto.senderDeviceId,
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
    @Param('roomId', ParseUUIDPipe) roomId: string,
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
  async getRoomMembers(
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ) {
    return this.rooms.getRoomMembers(roomId);
  }
}
