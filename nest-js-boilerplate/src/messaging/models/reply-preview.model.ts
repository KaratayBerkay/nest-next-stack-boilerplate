import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * The small quoted-reply shape shown above a message's content — never the
 * full generated `Message` type (which is @HideField()'d on `replyTo` to
 * avoid clients pulling raw ciphertext/full sender/recipient objects into a
 * quote preview). Built by `buildReplyPreview` in `message-body.util.ts`.
 */
@ObjectType()
export class ReplyPreview {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  senderId!: string;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => Boolean)
  hasAttachments!: boolean;
}
