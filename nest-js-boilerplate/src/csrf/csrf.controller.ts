import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
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

  /**
   * Self-test target for the CSRF middleware: the only thing that calls it
   * is `test/csrf.e2e-spec.ts`, which proves doubleCsrfProtection (wired in
   * CsrfModule) 403s a write without a token and lets one through with it.
   * Neither client uses it, so it is not part of the product API — outside
   * test/development it doesn't exist (404), which keeps a body-reflecting
   * endpoint out of production for no benefit.
   */
  @Post('echo')
  echo(@Req() req: Request): { received: unknown } {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException();
    return { received: req.body };
  }
}
