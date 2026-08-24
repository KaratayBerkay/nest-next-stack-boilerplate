import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { RtcCallService } from './rtc-call.service';

/**
 * REST-via-BFF surface for RTC — the frontend's authoritative integration
 * path (matches the observed send-message.ts convention; WS frames own the
 * actual call signaling, this controller only serves history/reads).
 */
@ApiTags('RTC')
@ApiBearerAuth()
@Controller('api/rtc')
@UseGuards(SessionAuthGuard)
export class RtcController {
  constructor(private readonly calls: RtcCallService) {}

  @Get('calls')
  @ApiOperation({ summary: 'Paginated 1:1 call history for the current user' })
  @ApiQuery({ name: 'before', required: false })
  @ApiQuery({ name: 'take', required: false })
  async history(
    @CurrentUser() user: JwtUser,
    @Query('before') before?: string,
    @Query('take') take?: string,
  ) {
    const parsed = take ? parseInt(take, 10) : 30;
    const safeTake = Math.min(
      Math.max(Number.isFinite(parsed) ? parsed : 30, 1),
      100,
    );
    return this.calls.getCallHistory(user.userId, before, safeTake);
  }

  @Get('calls/active')
  @ApiOperation({
    summary:
      'Any call currently ringing (as callee) or connected for the current user',
    description:
      'Recovery path for a client that (re)connected and may have missed the ' +
      "point-in-time rtc:invite/rtc:accepted WS push — mirrors messaging's " +
      'get-room-members on-demand pull.',
  })
  async active(@CurrentUser() user: JwtUser) {
    return { call: await this.calls.getActiveCallSnapshot(user.userId) };
  }
}
