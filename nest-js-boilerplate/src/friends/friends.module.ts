import { Module } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { FriendsResolver } from './friends.resolver';
import { FriendsService } from './friends.service';

// AuthModule imports FriendsModule (SessionHydrationService needs FriendsService);
// FriendsModule imports AuthContractsModule (SessionAuthGuard, CurrentUser, types) —
// no forwardRef needed because AuthContractsModule doesn't import FriendsModule.
@Module({
  imports: [AuthContractsModule],
  providers: [FriendsService, FriendsResolver],
  exports: [FriendsService],
})
export class FriendsModule {}
