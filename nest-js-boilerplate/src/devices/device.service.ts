import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { CryptoService } from '../common/crypto/crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { deviceCookieName, deviceCookieOptions } from './device-cookie';

// Passed from the resolver: we read the device cookie off `req` and write the refreshed cookie
// on `req.res` (Express keeps a back-reference to the response there).
export interface RequestContext {
  req: Request;
}

// What the auth flow needs to bind + dedup a session.
export interface DeviceContext {
  deviceId: string;
  /** ≥90-char random token for the device_token cookie. */
  deviceToken: string;
  /** true when this device was not recognized for the user (new/changed device). */
  changed: boolean;
  ip: string | null;
  userAgent: string | null;
}

// Minimal view of the cookie bag cookie-parser attaches (typed `any` on Express.Request).
interface CookieCarrier {
  cookies?: Record<string, string | undefined>;
  signedCookies?: Record<string, string | undefined>;
}

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Resolve the device for a just-authenticated user from the device-token cookie:
   *   - cookie present AND its Device row belongs to this user -> reuse it (`changed: false`)
   *   - cookie missing / unknown id / belongs to another user  -> mint a new Device (`changed: true`)
   * Always (re)writes the cookie so its expiry slides forward, and records `lastSeenAt`.
   */
  async resolveForLogin(
    userId: string,
    ctx: RequestContext,
  ): Promise<DeviceContext> {
    const { req } = ctx;
    const ip = req.ip ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    const fingerprint = userAgent ? this.crypto.sha256(userAgent) : null;

    const cookieName = deviceCookieName(this.config);
    const presentedToken = this.readCookie(req, cookieName);
    const token = this.crypto.randomToken();

    // Look up by the random token, not by UUID. Old-format cookies (raw UUID)
    // won't match — a new Device row is minted (effectively a new device).
    const existing = presentedToken
      ? await this.prisma.device.findUnique({
          where: { token: presentedToken },
        })
      : null;

    const reused = existing !== null && existing.userId === userId;

    const device = reused
      ? await this.prisma.device.update({
          where: { id: existing.id },
          data: { token, lastSeenAt: new Date(), fingerprint, ip },
        })
      : await this.prisma.device.create({
          data: {
            userId,
            type: 'WEB',
            token,
            fingerprint,
            ip,
            lastSeenAt: new Date(),
          },
        });

    this.writeCookie(req, cookieName, device.token);

    return {
      deviceId: device.id,
      deviceToken: device.token,
      changed: !reused,
      ip,
      userAgent,
    };
  }

  private readCookie(req: Request, name: string): string | null {
    const carrier = req as unknown as CookieCarrier;
    return carrier.cookies?.[name] ?? carrier.signedCookies?.[name] ?? null;
  }

  private writeCookie(req: Request, name: string, value: string): void {
    // Express attaches the response to `req.res`; guard for non-HTTP execution contexts.
    req.res?.cookie(name, value, deviceCookieOptions(this.config));
  }
}
