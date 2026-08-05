import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { createHash } from 'node:crypto';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { WireCryptoService } from './wire-crypto.service';
import { HandshakeDto } from './dto/handshake.dto';

function hashDeviceToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@ApiTags('Wire Crypto')
@ApiBearerAuth()
@Controller('api/crypto')
@UseInterceptors(LoggingInterceptor)
@UseGuards(SessionAuthGuard)
export class WireCryptoController {
  constructor(
    private readonly wire: WireCryptoService,
    private readonly logger: Logger,
  ) {}

  /**
   * Handshake: exchange client device public key, derive shared secret.
   *
   * If an x-device-token header is present, uses device-based (persistent) keys.
   * Otherwise falls back to session-based (ephemeral) keys.
   */
  @Post('handshake')
  @ApiOperation({
    summary:
      'Exchange client device key; derive the per-device or per-session shared secret',
  })
  async handshake(
    @CurrentUser() user: JwtUser,
    @Body() dto: HandshakeDto,
    @Headers('x-device-token') deviceTokenHeader?: string,
  ) {
    const sessionId = user.sessionId;
    if (!sessionId) {
      throw new BadRequestException('No session bound to request');
    }

    const deviceHash = deviceTokenHeader
      ? hashDeviceToken(deviceTokenHeader)
      : undefined;

    if (deviceHash) {
      // Device-based handshake (persistent keys).
      const alreadyHasKeys = await this.wire.hasDeviceKeys(deviceHash);
      await this.wire.setDevicePeerPublicKey(deviceHash, dto.publicKey);
      const serverPublicKey = await this.wire.getDevicePublicKey(deviceHash);
      if (!serverPublicKey) {
        throw new NotFoundException('Failed to create device crypto keys');
      }
      this.logger.debug(
        `device handshake deviceHash=${deviceHash} reKey=${alreadyHasKeys}`,
      );
      const { c2sSeq, s2cSeq } = await this.wire.getCounters(
        deviceHash,
        sessionId,
      );
      return { serverPublicKey, ok: true, device: true, c2sSeq, s2cSeq };
    }

    // Session-based handshake (ephemeral fallback).
    if (!(await this.wire.hasKeys(sessionId))) {
      await this.wire.createSessionKeys(sessionId);
    }
    await this.wire.setPeerPublicKey(sessionId, dto.publicKey);
    const serverPublicKey = await this.wire.getServerPublicKey(sessionId);
    if (!serverPublicKey) {
      throw new NotFoundException('No session crypto keys registered');
    }
    const counters = await this.wire.getCounters(undefined, sessionId);
    return {
      serverPublicKey,
      ok: true,
      device: false,
      ...counters,
    };
  }

  /**
   * Re-key: flush device keys and generate a fresh server keypair.
   * Client must also flush its stored keys and perform a new handshake.
   */
  @Post('re-key')
  @ApiOperation({
    summary: 'Flush crypto keys for this device; client must re-handshake',
  })
  async reKey(
    @CurrentUser() user: JwtUser,
    @Headers('x-device-token') deviceTokenHeader?: string,
  ) {
    if (!deviceTokenHeader) {
      throw new BadRequestException('No device token for re-key');
    }
    const deviceHash = hashDeviceToken(deviceTokenHeader);
    await this.wire.deleteDeviceKeys(deviceHash);
    this.logger.log(`re-key deviceHash=${deviceHash}`);
    return { ok: true };
  }

  @Get('server-key')
  @ApiOperation({
    summary: 'Fetch the current server public key (re-handshake after reload)',
  })
  async getServerKey(
    @CurrentUser() user: JwtUser,
    @Headers('x-device-token') deviceTokenHeader?: string,
  ) {
    const sessionId = user.sessionId;
    if (!sessionId) {
      throw new BadRequestException('No session bound to request');
    }

    const deviceHash = deviceTokenHeader
      ? hashDeviceToken(deviceTokenHeader)
      : undefined;

    if (deviceHash) {
      const pub = await this.wire.getDevicePublicKey(deviceHash);
      if (!pub) {
        throw new NotFoundException('No device crypto keys registered');
      }
      const { c2sSeq, s2cSeq } = await this.wire.getCounters(
        deviceHash,
        sessionId,
      );
      return { serverPublicKey: pub, device: true, c2sSeq, s2cSeq };
    }

    const serverPublicKey = await this.wire.getServerPublicKey(sessionId);
    if (!serverPublicKey) {
      throw new NotFoundException('No session crypto keys registered');
    }
    const counters = await this.wire.getCounters(undefined, sessionId);
    return { serverPublicKey, device: false, ...counters };
  }
}
