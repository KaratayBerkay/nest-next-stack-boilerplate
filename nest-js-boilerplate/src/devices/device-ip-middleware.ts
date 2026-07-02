import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { deviceCookieName } from './device-cookie';

/**
 * Middleware that checks the requesting IP against the IP stored on the Device record.
 *
 * On login/register the device's IP is recorded. On every subsequent request bearing a
 * `device_token` cookie, this middleware looks up the device and verifies the IP matches.
 * If the IP has changed the session is considered hijacked and is dropped (401).
 *
 * The check is skipped when:
 *   - No device_token cookie is present (anonymous request)
 *   - The stored IP is null (legacy devices before this middleware was added)
 *   - The request IP is null (unlikely, but defensive)
 */
@Injectable()
export class DeviceIpMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const cookieName = deviceCookieName(this.config);
    const carrier = req as unknown as {
      cookies?: Record<string, string | undefined>;
    };
    const token = carrier.cookies?.[cookieName] ?? null;

    // No device cookie → anonymous → skip
    if (!token) {
      next();
      return;
    }

    const requestIp = req.ip ?? null;
    // Can't compare if we don't have an IP
    if (!requestIp) {
      next();
      return;
    }

    try {
      const device = await this.prisma.device.findUnique({
        where: { token },
        select: { ip: true },
      });

      // No device found for this token → stale cookie → skip (guard will handle auth)
      if (!device) {
        next();
        return;
      }

      // No stored IP (legacy device before this check was added) → skip
      if (!device.ip) {
        next();
        return;
      }

      if (device.ip !== requestIp) {
        // IP mismatch – potential session hijack. Drop auth cookies and reject.
        res.clearCookie(cookieName, { path: '/' });
        throw new UnauthorizedException(
          'Device IP mismatch – session terminated for security',
        );
      }

      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      // DB error → fail open (let the request proceed)
      next();
    }
  }
}
