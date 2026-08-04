import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { WireCryptoService } from './wire-crypto.service';
import { HandshakeDto } from './dto/handshake.dto';

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

  @Post('handshake')
  @ApiOperation({
    summary: 'Exchange client device key; derive the per-session shared secret',
  })
  async handshake(@CurrentUser() user: JwtUser, @Body() dto: HandshakeDto) {
    const sessionId = user.sessionId;
    if (!sessionId) {
      throw new BadRequestException('No session bound to request');
    }
    await this.wire.setPeerPublicKey(sessionId, dto.publicKey);
    const serverPublicKey = await this.wire.getServerPublicKey(sessionId);
    if (!serverPublicKey) {
      throw new NotFoundException('No session crypto keys registered');
    }
    return { serverPublicKey, ok: true };
  }

  @Get('server-key')
  @ApiOperation({
    summary:
      'Fetch the current session server public key (re-handshake after reload)',
  })
  async getServerKey(@CurrentUser() user: JwtUser) {
    const sessionId = user.sessionId;
    if (!sessionId) {
      throw new BadRequestException('No session bound to request');
    }
    const serverPublicKey = await this.wire.getServerPublicKey(sessionId);
    if (!serverPublicKey) {
      throw new NotFoundException('No session crypto keys registered');
    }
    return { serverPublicKey };
  }
}
