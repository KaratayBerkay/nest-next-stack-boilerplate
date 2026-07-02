import { Body, Controller, Get, Post, Req, Session } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionData } from 'express-session';

// Type our custom session fields (module augmentation — the documented way to
// type req.session.* under strict TS).
declare module 'express-session' {
  interface SessionData {
    visits?: number;
    user?: string;
  }
}

@Controller('session')
export class SessionController {
  // Docs example: read/write via @Req() req.session.
  @Get('visits-req')
  visitsViaReq(@Req() request: Request): { visits: number } {
    request.session.visits = request.session.visits
      ? request.session.visits + 1
      : 1;
    return { visits: request.session.visits };
  }

  // Docs example: the dedicated @Session() decorator.
  @Get('visits')
  visits(@Session() session: SessionData): { visits: number } {
    session.visits = session.visits ? session.visits + 1 : 1;
    return { visits: session.visits };
  }

  @Post('login')
  login(
    @Body() body: { user: string },
    @Session() session: SessionData,
  ): { user: string } {
    session.user = body.user;
    return { user: body.user };
  }

  @Get('me')
  me(@Session() session: SessionData): { user: string | null } {
    return { user: session.user ?? null };
  }

  @Post('logout')
  logout(@Req() request: Request): Promise<{ loggedOut: true }> {
    return new Promise((resolve, reject) => {
      request.session.destroy((err) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve({ loggedOut: true });
      });
    });
  }
}
