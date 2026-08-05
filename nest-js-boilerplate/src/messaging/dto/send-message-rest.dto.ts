import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  IsArray,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TextOrAttachmentConstraint } from './text-or-attachment.constraint';
import { EnvelopeSizeConstraint } from './envelope-size.constraint';

class AttachmentEnvelopeDto {
  @IsString()
  v!: string;

  @IsString()
  nonce!: string;

  @IsString()
  ct!: string;
}

class MessageAttachmentDto {
  @IsUrl({ require_tld: false })
  @ApiProperty({
    description: 'Attachment file URL (from POST /upload/attachment)',
  })
  url!: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ description: 'Attachment MIME type' })
  type!: string;

  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'Original attachment file name' })
  name!: string;

  @ValidateNested()
  @Type(() => AttachmentEnvelopeDto)
  @IsOptional()
  @ApiProperty({
    description:
      'Server-side at-rest encryption envelope for the attachment blob (v/ct/nonce)',
    required: false,
  })
  storageEnvelope?: AttachmentEnvelopeDto;
}

export class SendMessageRestDto {
  @IsString()
  @MaxLength(5000)
  @Validate(TextOrAttachmentConstraint)
  @ApiProperty({
    description:
      'Message body (required when no attachment or envelope is sent)',
    maxLength: 5000,
    required: false,
  })
  text?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Client-generated temp ID for optimistic reconciliation',
    required: false,
  })
  _tempId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  @IsOptional()
  @ApiProperty({
    description: 'Attachments (one or many files attached to this message)',
    type: [MessageAttachmentDto],
    required: false,
  })
  attachments?: MessageAttachmentDto[];

  @IsObject()
  @IsOptional()
  @Validate(EnvelopeSizeConstraint)
  @ApiProperty({
    description:
      'E2EE envelope (MessageEnvelopeV1). When present, the message is stored encrypted.',
    required: false,
  })
  envelope?: Record<string, unknown>;
}
