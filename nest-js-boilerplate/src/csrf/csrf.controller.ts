import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { generateCsrfToken } from './csrf.middleware';

@Controller('csrf')
export class CsrfController {
  // GET is an ignored method, so it isn't blocked. It sets the CSRF cookie and returns the
  // token the client must echo back in the `x-csrf-token` header on writes.
  @Get('token')
  token(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { token: string } {
    return { token: generateCsrfToken(req, res) };
  }

  // Guarded by doubleCsrfProtection (wired in CsrfModule). Missing/invalid token -> 403.
  @Post('echo')
  echo(@Req() req: Request): { received: unknown } {
    return { received: req.body };
  }
}
