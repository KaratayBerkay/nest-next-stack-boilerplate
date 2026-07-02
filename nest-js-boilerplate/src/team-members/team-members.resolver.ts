import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TeamMember } from '../@generated/team-member/team-member.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTeamMemberInput } from './dto/create-team-member.input';
import { TeamMembersService } from './team-members.service';

// Exercises GraphQL through FK depth (TeamMember -> Team -> Organization -> User) behind the guard.
@UseGuards(JwtAuthGuard)
@Resolver(() => TeamMember)
export class TeamMembersResolver {
  constructor(private readonly teamMembers: TeamMembersService) {}

  @Query(() => [TeamMember], { name: 'teamMembers' })
  findAll() {
    return this.teamMembers.findAll();
  }

  @Mutation(() => TeamMember)
  createTeamMember(
    @CurrentUser() user: JwtUser,
    @Args('data') data: CreateTeamMemberInput,
  ) {
    return this.teamMembers.create(user.userId, data);
  }
}
