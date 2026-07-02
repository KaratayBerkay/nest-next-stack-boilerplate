import { Field, Int, ObjectType } from '@nestjs/graphql';

// Read-only view of what the MetricsPlugin has observed so far.
@ObjectType()
export class MetricsSnapshot {
  @Field(() => Int)
  requestCount: number;

  @Field(() => Int)
  completedCount: number;

  @Field(() => String, { nullable: true })
  lastOperationName: string | null;
}
