import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DevicesModule } from '../devices/devices.module';
import { CookiesSsrController } from './cookies-ssr.controller';
import { CookiesSsrService } from './cookies-ssr.service';

/**
 * SSR / CSR cookie demo module.
 *
 * Demonstrates:
 *   - Server-side httpOnly cookies (device, access, refresh) with Domain sharing
 *   - Client-side JS-readable cookies (theme)
 *   - All 3 auth cookies set on login, cleared on logout
 *
 * Depends on global providers (Prisma, Crypto, DeviceService) and JwtModule for
 * token verification.
 */
@Module({
  imports: [
    DevicesModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_ACCESS_TTL',
            '900s',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [CookiesSsrController],
  providers: [CookiesSsrService],
})
export class CookiesSsrModule {}
