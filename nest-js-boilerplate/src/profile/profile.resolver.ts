import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileInput } from './dto/update-profile.input';
import { ProfileService } from './profile.service';

@UseGuards(SessionAuthGuard)
@Resolver()
export class ProfileResolver {
  constructor(
    private readonly profile: ProfileService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => User, { name: 'myProfile' })
  async myProfile(@CurrentUser() user: JwtUser) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
  }

  @Query(() => Boolean)
  async isUsernameAvailable(
    @Args('username') username: string,
    @CurrentUser() user: JwtUser,
  ): Promise<boolean> {
    return this.profile.isUsernameAvailable(username, user.userId);
  }

  @Mutation(() => User)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: JwtUser,
  ) {
    return this.profile.updateProfile(user.userId, input);
  }
}
