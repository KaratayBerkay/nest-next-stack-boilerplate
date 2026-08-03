import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../@generated/user/user.model';

@ObjectType()
export class Conversation {
  @Field(() => User)
  user!: User;

  @Field(() => GraphQLJSON, { nullable: true })
  lastMessage?: string | Record<string, unknown>;

  @Field(() => Date, { nullable: true })
  lastTime?: Date;

  @Field(() => Number)
  unread!: number;
}
