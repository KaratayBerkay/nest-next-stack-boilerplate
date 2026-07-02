import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

// cookie-parser is applied app-wide in main.ts (`app.use(cookieParser(COOKIE_SECRET))`), so
// req.cookies / req.signedCookies are populated here. The e2e mirrors that middleware.
@Controller('cookies')
export class CookiesController {
  // Sets a plain cookie and a signed one. `passthrough: true` lets Nest still send the body.
  @Post('set')
  set(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.cookie('plain', 'plain-value', { httpOnly: true, sameSite: 'lax' });
    res.cookie('signed', 'signed-value', { httpOnly: true, signed: true });
    return { ok: true };
  }

  // Unsigned cookies land in req.cookies; signed (and verified) ones in req.signedCookies.
  // A tampered signed cookie is exposed as `false` by cookie-parser.
  @Get('read')
  read(@Req() req: Request): {
    cookies: Record<string, unknown>;
    signedCookies: Record<string, unknown>;
  } {
    return {
      cookies: req.cookies as Record<string, unknown>,
      signedCookies: req.signedCookies as Record<string, unknown>,
    };
  }
}
