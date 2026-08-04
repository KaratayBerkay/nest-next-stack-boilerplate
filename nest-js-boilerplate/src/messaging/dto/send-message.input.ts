import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
  IsObject,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TextOrAttachmentConstraint } from './text-or-attachment.constraint';
import { EnvelopeSizeConstraint } from './envelope-size.constraint';

@InputType()
export class SendMessageInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Recipient user ID' })
  recipientId!: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(5000)
  @Validate(TextOrAttachmentConstraint)
  @ApiProperty({
    description: 'Message body (required when no attachment or envelope is sent)',
    maxLength: 5000,
    required: false,
  })
  text?: string;

  @Field({ nullable: true })
  @IsUrl({ require_tld: false })
  @IsOptional()
  @ApiProperty({
    description: 'Attachment file URL (from POST /upload/attachment)',
    required: false,
  })
  attachmentUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty({ description: 'Attachment MIME type', required: false })
  attachmentType?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @ApiProperty({ description: 'Original attachment file name', required: false })
  attachmentName?: string;

  @Field(() => String, { nullable: true })
  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Server-side at-rest encryption envelope for the attachment blob',
    required: false,
  })
  attachmentEnvelope?: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  @IsObject()
  @IsOptional()
  @Validate(EnvelopeSizeConstraint)
  @ApiProperty({
    description:
      'E2EE envelope as JSON string (MessageEnvelopeV1). When present, body is stored as null and the message is encrypted.',
    required: false,
  })
  envelope?: Record<string, unknown>;
}
