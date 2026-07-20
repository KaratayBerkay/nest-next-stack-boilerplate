// fallow-ignore-next-line circular-dependency — Federation subgraph bidirectional ref
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from './post.entity';

// In Federation 2 a subgraph contributes fields to an entity it doesn't own without `@extends`/
// `@external`: this subgraph adds `posts` to User, keyed by the shared `id`. The users subgraph
// owns User's scalar fields; this one supplies the relationship back to its own Posts.
@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}
