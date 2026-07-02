import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PassportJwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { PassportAuthService } from './passport-auth.service';
import type { PassportUser } from './passport-users.service';

@Controller('passport')
export class PassportAuthController {
  constructor(private readonly authService: PassportAuthService) {}

  // LocalAuthGuard runs LocalStrategy.validate(); on success Passport sets req.user, which we
  // exchange for a signed JWT. (`req.user` is Express.User — cast to our shape; docs use `any`.)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request): { access_token: string } {
    return this.authService.login(req.user as PassportUser);
  }

  // PassportJwtAuthGuard runs JwtStrategy: it verifies the Bearer token and sets req.user from
  // the decoded payload. No token / bad token -> 401 before this handler runs.
  @UseGuards(PassportJwtAuthGuard)
  @Get('profile')
  profile(@Req() req: Request): PassportUser {
    return req.user as PassportUser;
  }
}
