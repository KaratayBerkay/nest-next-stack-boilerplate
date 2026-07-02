import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Techniques › Performance / Fastify (#41). The same Nest controller idioms run
 * unchanged on the Fastify adapter; the `@Res()`/`@Req()` objects are Fastify's
 * `FastifyReply`/`FastifyRequest` (not Express), so handlers use the Fastify API
 * (`.header().send()`, `.status().redirect()`).
 */
@Controller('fastify')
export class FastifyDemoController {
  @Get('hello')
  hello(): { message: string } {
    return { message: 'fast' };
  }

  // Fastify reply API: chainable .header() + .send().
  @Get('engine')
  engine(@Res() reply: FastifyReply): void {
    reply.header('x-engine', 'fastify').send({ ok: true });
  }

  // FastifyRequest typing on @Req().
  @Get('agent')
  agent(@Req() request: FastifyRequest): { ua: string } {
    return { ua: request.headers['user-agent'] ?? 'unknown' };
  }

  @Post('echo')
  echo(@Body() body: unknown): { echoed: unknown } {
    return { echoed: body };
  }

  // Fastify redirect — the documented form (set status, then redirect). In
  // Fastify v5 redirect(url, code?) reuses a pre-set status code when none is given.
  @Get('redirect')
  redirect(@Res() reply: FastifyReply): void {
    reply.status(302).redirect('/login');
  }
}
