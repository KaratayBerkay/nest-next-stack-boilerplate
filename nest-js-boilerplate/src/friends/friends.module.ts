import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsResolver } from './friends.resolver';
import { FriendsService } from './friends.service';

// AuthModule imports FriendsModule (SessionHydrationService needs FriendsService); forwardRef()
// on both sides breaks the otherwise-unresolvable cycle.
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [FriendsService, FriendsResolver],
  exports: [FriendsService],
})
export class FriendsModule {}
