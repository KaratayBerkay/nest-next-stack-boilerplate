import { Module, forwardRef } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { FriendsResolver } from './friends.resolver';
import { FriendsService } from './friends.service';

// AuthModule imports FriendsModule (SessionHydrationService needs FriendsService);
// FriendsModule imports AuthContractsModule (SessionAuthGuard, CurrentUser, types).
// forwardRef is required here now: E2eeModule imports FriendsModule (for the
// claimBundle friendship check) AND AuthContractsModule imports E2eeModule,
// which makes this edge part of a real cycle
// (AuthContractsModule -> E2eeModule -> FriendsModule -> AuthContractsModule).
@Module({
  imports: [forwardRef(() => AuthContractsModule)],
  providers: [FriendsService, FriendsResolver],
  exports: [FriendsService],
})
export class FriendsModule {}
