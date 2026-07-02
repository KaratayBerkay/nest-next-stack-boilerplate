import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

// The User entity is OWNED by this subgraph. `@key(fields: "id")` makes it a federated entity that
// other subgraphs can reference by id (docs.nestjs.com/graphql/federation, Federation 2 code-first).
@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;
}
