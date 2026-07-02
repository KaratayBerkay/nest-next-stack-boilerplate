import { Field, Int, ObjectType } from '@nestjs/graphql';

// Minimal object type carried over the subscription stream. Named "LiveNotification" to
// avoid colliding with the Prisma-generated `Notification` model in the app-wide schema.
@ObjectType()
export class LiveNotification {
  @Field(() => Int)
  id: number;

  @Field()
  channel: string;

  @Field()
  message: string;
}
