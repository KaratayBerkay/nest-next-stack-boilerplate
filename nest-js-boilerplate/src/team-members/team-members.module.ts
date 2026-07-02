import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TeamMembersResolver } from './team-members.resolver';
import { TeamMembersService } from './team-members.service';

// AuthModule exports JwtAuthGuard (+ JwtModule) used by the @UseGuards on the resolver.
@Module({
  imports: [AuthModule],
  providers: [TeamMembersResolver, TeamMembersService],
})
export class TeamMembersModule {}
