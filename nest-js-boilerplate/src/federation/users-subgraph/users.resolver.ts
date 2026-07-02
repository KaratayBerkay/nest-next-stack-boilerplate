import { Args, ID, Query, ResolveReference, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'getUser', nullable: true })
  getUser(@Args('id', { type: () => ID }) id: number): User | undefined {
    return this.usersService.findById(id);
  }

  // Called by the gateway to materialise a User that another subgraph referenced by @key — this is
  // what turns a bare `{ __typename: 'User', id }` reference into a full User.
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: number;
  }): User | undefined {
    return this.usersService.findById(reference.id);
  }
}
