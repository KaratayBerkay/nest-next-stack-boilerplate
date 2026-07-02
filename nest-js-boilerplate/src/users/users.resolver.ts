import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// Both the object type and the (validated) input type are auto-generated from the
// Prisma schema by prisma-nestjs-graphql.
import { User } from '../@generated/user/user.model';
import { UserCreateInput } from '../@generated/user/user-create.input';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  createUser(@Args('data') data: UserCreateInput) {
    return this.usersService.create(data);
  }
}
