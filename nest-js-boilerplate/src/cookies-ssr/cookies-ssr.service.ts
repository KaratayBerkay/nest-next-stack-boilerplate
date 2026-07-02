import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { CryptoService } from '../common/crypto/crypto.service';
import { DeviceService } from '../devices/device.service';
import type { RequestContext } from '../devices/device.service';
import { PrismaService } from '../prisma/prisma.service';
import { accessCookieName, accessCookieOptions } from '../auth/access-cookie';
import { refreshCookieName, refreshCookieOptions } from '../auth/auth-cookie';
import {
  deviceCookieName,
  deviceCookieOptions,
} from '../devices/device-cookie';

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30d

@Injectable()
export class CookiesSsrService {
  private readonly logger = new Logger(CookiesSsrService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly devices: DeviceService,
  ) {}

  /**
   * Login: issues device + access + refresh cookies with Domain=.COOKIE_DOMAIN
   * so every subdomain (x.eys.gen.tr) reads them automatically.
   */
  async login(
    email: string,
    ctx: RequestContext,
  ): Promise<{ user: { id: string; email: string } }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const device = await this.devices.resolveForLogin(user.id, ctx);
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies JwtPayload);

    const session = await this.prisma.$transaction(async (tx) => {
      if (device?.deviceId) {
        await tx.session.deleteMany({
          where: { userId: user.id, deviceId: device.deviceId },
        });
      }
      return tx.session.create({
        data: {
          sessionToken: this.crypto.randomToken(),
          userId: user.id,
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
          deviceId: device?.deviceId ?? null,
          ip: device?.ip ?? null,
          userAgent: device?.userAgent ?? null,
        },
      });
    });

    this.setDeviceCookie(ctx, device.deviceToken);
    this.setAccessCookie(ctx, accessToken);
    this.setRefreshCookie(ctx, session.sessionToken);

    return { user: { id: user.id, email: user.email } };
  }

  me(ctx: RequestContext): {
    device: string | null;
    access: string | null;
    refresh: string | null;
    user: { id: string; email: string } | null;
  } {
    const device = this.readCookie(ctx.req, deviceCookieName(this.config));
    const access = this.readCookie(ctx.req, accessCookieName(this.config));
    const refresh = this.readCookie(ctx.req, refreshCookieName(this.config));

    let user: { id: string; email: string } | null = null;
    if (access) {
      try {
        const payload = this.jwt.verify<JwtPayload>(access);
        user = { id: payload.sub, email: payload.email };
      } catch {
        // access token expired — that's expected, user can refresh
      }
    }

    return { device, access, refresh, user };
  }

  logout(ctx: RequestContext): { ok: true } {
    this.clearCookies(ctx);
    return { ok: true };
  }

  clearCookies(ctx: RequestContext): void {
    const { req } = ctx;
    req.res?.clearCookie(
      deviceCookieName(this.config),
      deviceCookieOptions(this.config),
    );
    req.res?.clearCookie(
      accessCookieName(this.config),
      accessCookieOptions(this.config),
    );
    req.res?.clearCookie(
      refreshCookieName(this.config),
      refreshCookieOptions(this.config),
    );
  }

  private setDeviceCookie(ctx: RequestContext, value: string): void {
    ctx.req.res?.cookie(
      deviceCookieName(this.config),
      value,
      deviceCookieOptions(this.config),
    );
  }

  private setAccessCookie(ctx: RequestContext, value: string): void {
    ctx.req.res?.cookie(
      accessCookieName(this.config),
      value,
      accessCookieOptions(this.config),
    );
  }

  private setRefreshCookie(ctx: RequestContext, value: string): void {
    ctx.req.res?.cookie(
      refreshCookieName(this.config),
      value,
      refreshCookieOptions(this.config),
    );
  }

  private readCookie(req: Request, name: string): string | null {
    const carrier = req as unknown as {
      cookies?: Record<string, string | undefined>;
      signedCookies?: Record<string, string | undefined>;
    };
    return carrier.cookies?.[name] ?? carrier.signedCookies?.[name] ?? null;
  }
}
