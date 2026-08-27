import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { UserPrivacyResolver } from './user-privacy.resolver';

@Module({
  imports: [AuthModule],
  providers: [ProfileResolver, ProfileService, UserPrivacyResolver],
})
export class ProfileModule {}
