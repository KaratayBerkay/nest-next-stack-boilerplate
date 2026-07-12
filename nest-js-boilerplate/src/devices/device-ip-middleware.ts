import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { deviceCookieName } from './device-cookie';

@Injectable()
export class DeviceIpMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DeviceIpMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const cookieName = deviceCookieName(this.config);
    const carrier = req as unknown as {
      cookies?: Record<string, string | undefined>;
      signedCookies?: Record<string, string | undefined>;
    };
    const token =
      carrier.signedCookies?.[cookieName] ??
      carrier.cookies?.[cookieName] ??
      null;

    if (!token) {
      next();
      return;
    }

    const requestIp = req.ip ?? null;
    if (!requestIp) {
      next();
      return;
    }

    try {
      const device = await this.prisma.device.findUnique({
        where: { token },
        select: { id: true, ip: true },
      });

      if (!device) {
        next();
        return;
      }

      if (!device.ip) {
        next();
        return;
      }

      if (device.ip !== requestIp) {
        this.logger.log({
          category: 'http-exception',
          event: 'device-change',
          deviceId: device.id,
          previousIp: device.ip,
          newIp: requestIp,
        });

        await this.prisma.device.update({
          where: { id: device.id },
          data: { ip: requestIp },
        });

        const strict = this.config.get<string>('AUTH_IP_STRICT') === 'true';
        if (strict) {
          res.clearCookie(cookieName, { path: '/' });
          throw new UnauthorizedException(
            'Device IP mismatch – session terminated for security',
          );
        }

        next();
        return;
      }

      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      next();
    }
  }
}
