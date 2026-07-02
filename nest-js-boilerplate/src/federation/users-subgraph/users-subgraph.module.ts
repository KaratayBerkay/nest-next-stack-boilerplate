import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

// A federated subgraph that owns the User entity. `ApolloFederationDriver` + `autoSchemaFile:
// { federation: 2 }` emit a Federation 2 subgraph schema (via @apollo/subgraph's buildSubgraphSchema).
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 },
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class UsersSubgraphModule {}
