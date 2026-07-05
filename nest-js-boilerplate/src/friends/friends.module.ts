import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsResolver } from './friends.resolver';
import { FriendsService } from './friends.service';

@Module({
  imports: [AuthModule],
  providers: [FriendsService, FriendsResolver],
  exports: [FriendsService],
})
export class FriendsModule {}
