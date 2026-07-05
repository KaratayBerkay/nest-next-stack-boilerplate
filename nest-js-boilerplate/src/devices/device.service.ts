import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
   * Public handshake endpoint called on every page load (pre-auth).
   * Sets the device_token cookie if not present, or slides its expiry.
   * No Device row is created — that happens at login via `resolveForLogin`.
   */
  handshake(ctx: RequestContext): { deviceToken: string } {
    const { req } = ctx;
    const cookieName = deviceCookieName(this.config);
    const presented = this.readCookie(req, cookieName);
    if (presented) {
      // Slide the cookie expiry.
      this.writeCookie(req, cookieName, presented);
      return { deviceToken: presented };
    }
    // Mint a landing token (no Device row yet).
    const token = this.crypto.randomToken();
    this.writeCookie(req, cookieName, token);
    return { deviceToken: token };
  }

  /**
   * Resolve the device for a just-authenticated user from the device-token cookie:
   *   - cookie present AND its Device row belongs to this user -> reuse it (`changed: false`),
   *     update metadata without rotating the token
   *   - cookie present but no Device row exists (landing token) -> create Device row
   *     with the presented token (`changed: true`)
   *   - cookie present but belongs to another user -> claim it (`changed: true`)
   *   - cookie missing -> mint a new Device (`changed: true`)
   * Always (re)writes the cookie so its expiry slides forward.
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

    // Look up by the random token.
    const existing = presentedToken
      ? await this.prisma.device.findUnique({
          where: { token: presentedToken },
        })
      : null;

    let device: { id: string; token: string };

    if (existing && existing.userId === userId) {
      // Reuse — do NOT rotate the token, just update metadata.
      device = await this.prisma.device.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), fingerprint, ip },
      });
    } else if (presentedToken && !existing) {
      // Landing token — create Device row with the presented token.
      // Two concurrent requests with the same landing token could race here;
      // catch the unique violation and fall back to the winner's row.
      try {
        device = await this.prisma.device.create({
          data: {
            userId,
            type: 'WEB',
            token: presentedToken,
            fingerprint,
            ip,
            lastSeenAt: new Date(),
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const existingDevice = await this.prisma.device.findUniqueOrThrow({
            where: { token: presentedToken },
          });
          device = existingDevice;
        } else {
          throw err;
        }
      }
    } else if (existing && existing.userId !== userId) {
      // Foreign token — claim it by creating a new Device row.
      const token = this.crypto.randomToken();
      device = await this.prisma.device.create({
        data: {
          userId,
          type: 'WEB',
          token,
          fingerprint,
          ip,
          lastSeenAt: new Date(),
        },
      });
    } else {
      // No cookie — mint a new Device.
      const token = this.crypto.randomToken();
      device = await this.prisma.device.create({
        data: {
          userId,
          type: 'WEB',
          token,
          fingerprint,
          ip,
          lastSeenAt: new Date(),
        },
      });
    }

    this.writeCookie(req, cookieName, device.token);

    return {
      deviceId: device.id,
      deviceToken: device.token,
      changed: !(existing?.userId === userId),
      ip,
      userAgent,
    };
  }

  private readCookie(req: Request, name: string): string | null {
    // In production the BFF forwards the device token as x-device-token header
    // because the backend cookie is __Secure-device_token while the BFF stores the
    // unprefixed name. Check the header first (the BFF sets both), then cookie.
    const headerToken = req.headers['x-device-token'] as string | undefined;
    if (headerToken) return headerToken;
    const carrier = req as unknown as CookieCarrier;
    return carrier.cookies?.[name] ?? carrier.signedCookies?.[name] ?? null;
  }

  private writeCookie(req: Request, name: string, value: string): void {
    // Express attaches the response to `req.res`; guard for non-HTTP execution contexts.
    req.res?.cookie(name, value, deviceCookieOptions(this.config));
  }
}
