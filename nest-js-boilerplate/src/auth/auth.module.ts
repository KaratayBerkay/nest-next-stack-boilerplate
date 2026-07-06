import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DevicesModule } from '../devices/devices.module';
import { FriendsModule } from '../friends/friends.module';
import { MailModule } from '../mail/mail.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionHydrationService } from './session-hydration.service';
import { TokenStoreService } from './token-store.service';
import { TokenDerivationService } from './token-derivation.service';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { UsernameService } from './username.service';

@Module({
  imports: [
    MailModule,
    DevicesModule,
    // FriendsModule imports AuthModule (FriendsResolver needs SessionAuthGuard); forwardRef()
    // on both sides breaks the otherwise-unresolvable cycle.
    forwardRef(() => FriendsModule),
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
  controllers: [OAuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtAuthGuard,
    SessionAuthGuard,
    SessionHydrationService,
    TokenStoreService,
    TokenDerivationService,
    OAuthService,
    UsernameService,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    SessionAuthGuard,
    SessionHydrationService,
    TokenStoreService,
    TokenDerivationService,
  ],
})
export class AuthModule {}
