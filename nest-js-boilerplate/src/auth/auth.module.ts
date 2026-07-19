import { forwardRef, Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { FriendsModule } from '../friends/friends.module';
import { MailModule } from '../mail/mail.module';
import { AuthContractsModule } from './auth-contracts.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { SessionHydrationService } from './session-hydration.service';
import { UsernameService } from './username.service';

@Module({
  imports: [
    AuthContractsModule,
    MailModule,
    DevicesModule,
    // SessionHydrationService needs FriendsService for friend-list hydration;
    // forwardRef avoids a module cycle (FriendsModule → AuthContractsModule → AuthModule).
    forwardRef(() => FriendsModule),
  ],
  controllers: [OAuthController],
  providers: [
    AuthService,
    AuthResolver,
    SessionHydrationService,
    OAuthService,
    UsernameService,
  ],
  exports: [
    AuthService,
    SessionHydrationService,
    // Re-export so modules importing AuthModule get guards, token services, etc.
    AuthContractsModule,
  ],
})
export class AuthModule {}
