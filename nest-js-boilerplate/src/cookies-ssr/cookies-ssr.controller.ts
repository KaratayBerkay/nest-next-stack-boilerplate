import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CookiesSsrService } from './cookies-ssr.service';

interface LoginBody {
  email: string;
}

interface ThemeBody {
  theme: 'light' | 'dark' | 'ocean';
}

/**
 * SSR / CSR cookie demo.
 *
 * SERVER-SIDE (httpOnly, Domain-shared):
 *   POST /cookies-ssr/login   -> sets device_token, access_token, refresh_token
 *   GET  /cookies-ssr/me      -> reads all 3 cookies, validates access, returns user
 *   POST /cookies-ssr/logout  -> clears all 3 cookies
 *
 * CLIENT-SIDE (JS-readable, no httpOnly):
 *   GET  /cookies-ssr/status   -> which cookies are present (for SSR debugging)
 *   POST /cookies-ssr/theme    -> sets a non-httpOnly "theme" cookie (like frontend useTheme)
 *
 * All auth cookies carry Domain=.COOKIE_DOMAIN when configured, so subdomains
 * like app.eys.gen.tr and api.eys.gen.tr share them automatically.
 */
@Controller('cookies-ssr')
export class CookiesSsrController {
  constructor(private readonly ssr: CookiesSsrService) {}

  @Post('login')
  login(
    @Body() body: LoginBody,
    @Req() req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    return this.ssr.login(body.email, { req });
  }

  @Get('me')
  me(@Req() req: Request) {
    return this.ssr.me({ req });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) _res: Response) {
    return this.ssr.logout({ req });
  }

  @Get('status')
  status(@Req() req: Request) {
    const bag = (
      req as unknown as {
        cookies?: Record<string, string | undefined>;
        signedCookies?: Record<string, string | undefined>;
      }
    ).cookies;
    return {
      present: Object.keys(bag ?? {}),
      count: bag ? Object.keys(bag).length : 0,
    };
  }

  @Post('theme')
  setTheme(
    @Body() body: ThemeBody,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Client-side theme cookie: NOT httpOnly, so JS (useTheme hook) can read it.
    // The frontend can write the same cookie via document.cookie.
    res.cookie('theme', body.theme, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
    return { theme: body.theme };
  }
}
