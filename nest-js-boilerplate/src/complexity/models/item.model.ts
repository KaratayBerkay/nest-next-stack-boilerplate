import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Item {
  // Per-field cost picked up by graphql-query-complexity's fieldExtensionsEstimator.
  @Field({ complexity: 1 })
  name: string;
}
