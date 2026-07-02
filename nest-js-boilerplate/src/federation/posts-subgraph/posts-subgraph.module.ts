import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';

// A federated subgraph that owns Post and contributes `posts` to the shared User entity. `User` is
// referenced but has no root query here, so it's an orphaned type that must be registered explicitly.
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 },
      buildSchemaOptions: { orphanedTypes: [User] },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class PostsSubgraphModule {}
