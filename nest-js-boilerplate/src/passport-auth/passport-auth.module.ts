import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { PassportAuthController } from './passport-auth.controller';
import { PassportAuthService } from './passport-auth.service';
import { PassportUsersService } from './passport-users.service';

// The NestJS Passport recipe end-to-end: PassportModule + a module-scoped JwtModule, the two
// strategies (local + jwt) registered as providers, and an HTTP controller (/passport/login,
// /passport/profile). Deliberately a SEPARATE module from src/auth: the app's primary auth is
// GraphQL with a custom (non-Passport) guard; this proves the documented Passport path too.
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [PassportAuthController],
  providers: [
    PassportAuthService,
    PassportUsersService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class PassportAuthModule {}
