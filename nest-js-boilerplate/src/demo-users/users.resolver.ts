import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// Both the object type and the (validated) input type are auto-generated from the
// Prisma schema by prisma-nestjs-graphql.
import { User } from '../@generated/user/user.model';
import { UserCreateInput } from '../@generated/user/user-create.input';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../authorization/roles.guard';
import { Roles } from '../authorization/roles.decorator';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { DemoUsersService } from './users.service';

@UseGuards(SessionAuthGuard, RolesGuard)
@Resolver(() => User)
export class DemoUsersResolver {
  constructor(private readonly usersService: DemoUsersService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Mutation(() => User)
  createUser(@Args('data') data: UserCreateInput) {
    return this.usersService.create(data);
  }
}
