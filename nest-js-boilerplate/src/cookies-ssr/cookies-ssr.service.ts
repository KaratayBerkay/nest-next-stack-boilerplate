import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload, SessionUserInput } from '../auth/auth.types';
import { DeviceService } from '../devices/device.service';
import type { RequestContext } from '../devices/device.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionHydrationService } from '../auth/session-hydration.service';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { TokenStoreService } from '../auth/token-store.service';
import { accessCookieName, accessCookieOptions } from '../auth/access-cookie';
import { rbacCookieName, rbacCookieOptions } from '../auth/rbac-cookie';
import { userCookieName, userCookieOptions } from '../auth/user-cookie';
import {
  deviceCookieName,
  deviceCookieOptions,
} from '../devices/device-cookie';

@Injectable()
export class CookiesSsrService {
  private readonly logger = new Logger(CookiesSsrService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly devices: DeviceService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
    private readonly hydration: SessionHydrationService,
  ) {}

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

    const rbacToken = this.derivation.deriveRbacToken(
      user.id,
      user.subscriptionTier ?? 'FREE',
    );
    const userToken = this.derivation.deriveUserToken(user.id);
    const snapshot = await this.hydration.hydrate(user);
    const compoundKey = this.tokenStore.buildKey(
      accessToken,
      rbacToken,
      device.deviceToken,
      userToken,
    );
    const sessionId = compoundKey;
    await this.tokenStore.write(compoundKey, {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.subscriptionTier ?? 'FREE',
      deviceId: device.deviceId ?? null,
      ip: device.ip ?? null,
      userAgent: device.userAgent ?? null,
      sessionId,
      ...snapshot,
    } as SessionUserInput);

    this.setDeviceCookie(ctx, device.deviceToken);
    this.setAccessCookie(ctx, accessToken);
    this.setRbacCookie(ctx, rbacToken);
    this.setUserCookie(ctx, userToken);

    return { user: { id: user.id, email: user.email } };
  }

  me(ctx: RequestContext): {
    device: string | null;
    access: string | null;
    user: { id: string; email: string } | null;
  } {
    const device = this.readCookie(ctx.req, deviceCookieName(this.config));
    const access = this.readCookie(ctx.req, accessCookieName(this.config));

    let user: { id: string; email: string } | null = null;
    if (access) {
      try {
        const payload = this.jwt.verify<JwtPayload>(access);
        user = { id: payload.sub, email: payload.email };
      } catch {
        // access token expired
      }
    }

    return { device, access, user };
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

  private setRbacCookie(ctx: RequestContext, value: string): void {
    ctx.req.res?.cookie(
      rbacCookieName(this.config),
      value,
      rbacCookieOptions(this.config),
    );
  }

  private setUserCookie(ctx: RequestContext, value: string): void {
    ctx.req.res?.cookie(
      userCookieName(this.config),
      value,
      userCookieOptions(this.config),
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
