import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
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
import { FriendsService } from '../friends/friends.service';
import { E2eeKeysService } from './e2ee-keys.service';
import { RegisterBundleDto } from './dto/register-bundle.dto';
import { AddOneTimePrekeysDto } from './dto/add-one-time-prekeys.dto';

@ApiTags('E2EE Keys')
@ApiBearerAuth()
@Controller('api/e2ee/keys')
@UseInterceptors(LoggingInterceptor)
@UseGuards(SessionAuthGuard)
export class E2eeKeysController {
  constructor(
    private readonly keys: E2eeKeysService,
    private readonly friends: FriendsService,
    private readonly logger: Logger,
  ) {}

  @Post('bundle')
  @ApiOperation({ summary: 'Register or replace this devices key bundle' })
  async registerBundle(
    @CurrentUser() user: JwtUser,
    @Body() dto: RegisterBundleDto,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    return this.keys.registerBundle(
      user.userId,
      user.deviceId,
      dto.bundle,
      dto.oneTimePrekeys,
    );
  }

  @Post('bundle/:userId/claim')
  @ApiOperation({ summary: 'Fetch a peers bundle, atomically consuming one OPK' })
  async claimBundle(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser() user: JwtUser,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    // Claiming consumes a scarce, finite one-time-prekey — gate it behind
    // the same friendship requirement DM sending itself enforces, so a
    // non-friend can't grief a user's OTPK pool for a conversation they
    // could never actually have.
    if (targetUserId !== user.userId) {
      const isFriend = await this.friends.areFriends(
        user.userId,
        targetUserId,
      );
      if (!isFriend) {
        throw new ForbiddenException(
          'You can only exchange E2EE keys with friends',
        );
      }
    }
    const result = await this.keys.claimBundle(targetUserId);
    if (!result) {
      throw new NotFoundException(
        'User has no registered E2EE keys (may need to log in)',
      );
    }
    return result;
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Check whether a user has registered E2EE keys' })
  async getStatus(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.keys.getBundleStatus(userId);
  }

  @Post('one-time-prekeys')
  @ApiOperation({ summary: 'Replenish the one-time prekey pool' })
  async replenishPrekeys(
    @CurrentUser() user: JwtUser,
    @Body() dto: AddOneTimePrekeysDto,
  ) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    const count = await this.keys.replenishPrekeys(
      user.userId,
      dto.oneTimePrekeys,
    );
    return { count };
  }

  @Get('identity/:userId')
  @ApiOperation({ summary: "Get a peer's public identity signing key" })
  async getIdentityKey(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const result = await this.keys.getIdentityKey(userId);
    if (!result) {
      throw new NotFoundException(
        'User has no registered E2EE keys',
      );
    }
    return result;
  }

  @Post('wipe')
  @ApiOperation({ summary: 'Wipe this device E2EE keys (self-service)' })
  async wipeDevice(@CurrentUser() user: JwtUser) {
    if (!user.deviceId) {
      throw new BadRequestException('No device bound to session');
    }
    return this.keys.wipeDevice(user.userId, user.deviceId);
  }
}
