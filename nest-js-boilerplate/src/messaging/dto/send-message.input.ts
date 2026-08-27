import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
  IsObject,
  IsArray,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  OptionalMessageTextConstraint,
  TextOrAttachmentConstraint,
} from './text-or-attachment.constraint';
import { EnvelopeSizeConstraint } from './envelope-size.constraint';

@InputType()
class AttachmentEnvelopeInput {
  @Field()
  @IsString()
  v!: string;

  @Field()
  @IsString()
  nonce!: string;

  @Field()
  @IsString()
  ct!: string;
}

@InputType()
class MessageAttachmentInput {
  @Field()
  @IsUrl({ require_tld: false })
  @ApiProperty({
    description: 'Attachment file URL (from POST /upload/attachment)',
  })
  url!: string;

  @Field()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ description: 'Attachment MIME type' })
  type!: string;

  @Field()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'Original attachment file name' })
  name!: string;

  @Field(() => AttachmentEnvelopeInput, { nullable: true })
  @ValidateNested()
  @Type(() => AttachmentEnvelopeInput)
  @IsOptional()
  @ApiProperty({
    description:
      'Server-side at-rest encryption envelope for the attachment blob (v/ct/nonce)',
    required: false,
  })
  storageEnvelope?: AttachmentEnvelopeInput;
}

@InputType()
export class SendMessageInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Recipient user ID' })
  recipientId!: string;

  @Field({ nullable: true })
  @Validate(OptionalMessageTextConstraint)
  @Validate(TextOrAttachmentConstraint)
  @ApiProperty({
    description:
      'Message body (required when no attachment or envelope is sent)',
    maxLength: 5000,
    required: false,
  })
  text?: string;

  @Field(() => [MessageAttachmentInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentInput)
  @IsOptional()
  @ApiProperty({
    description: 'Attachments (one or many files attached to this message)',
    type: [MessageAttachmentInput],
    required: false,
  })
  attachments?: MessageAttachmentInput[];

  @Field(() => String, { nullable: true })
  @IsObject()
  @IsOptional()
  @Validate(EnvelopeSizeConstraint)
  @ApiProperty({
    description:
      'E2EE envelope as JSON string (MessageEnvelopeV1). When present, the message is stored encrypted.',
    required: false,
  })
  envelope?: Record<string, unknown>;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description:
      'ID of the message this one is replying to (same conversation only)',
    required: false,
  })
  replyToId?: string;
}
