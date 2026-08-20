import { Field, ObjectType } from '@nestjs/graphql';
import { Notification } from '../../@generated/notification/notification.model';

@ObjectType()
export class NotificationsPage {
  @Field(() => [Notification])
  items!: Notification[];

  @Field(() => Boolean)
  hasMore!: boolean;
}
