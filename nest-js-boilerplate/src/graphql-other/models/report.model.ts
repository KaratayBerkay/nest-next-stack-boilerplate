import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Report {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  // `summary` is added by a @ResolveField on the resolver (a computed field), so it isn't here.
}
