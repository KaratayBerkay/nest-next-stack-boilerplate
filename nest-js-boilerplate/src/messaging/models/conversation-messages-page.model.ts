import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from '../../@generated/message/message.model';

@ObjectType()
export class ConversationMessagesPage {
  @Field(() => [Message])
  messages!: Message[];

  @Field(() => Boolean)
  hasMore!: boolean;
}
