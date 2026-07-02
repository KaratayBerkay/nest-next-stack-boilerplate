import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../@generated/user/user.model';

@ObjectType()
export class Conversation {
  @Field(() => User)
  user!: User;

  @Field({ nullable: true })
  lastMessage?: string;

  @Field(() => Date, { nullable: true })
  lastTime?: Date;

  @Field(() => Number)
  unread!: number;
}
