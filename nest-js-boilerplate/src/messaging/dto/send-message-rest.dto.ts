import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TextOrAttachmentConstraint } from './text-or-attachment.constraint';
import { EnvelopeSizeConstraint } from './envelope-size.constraint';

export class SendMessageRestDto {
  @IsString()
  @MaxLength(5000)
  @Validate(TextOrAttachmentConstraint)
  @ApiProperty({
    description: 'Message body (required when no attachment or envelope is sent)',
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

  @IsUrl({ require_tld: false })
  @IsOptional()
  @ApiProperty({
    description: 'Attachment file URL (from POST /upload/attachment)',
    required: false,
  })
  attachmentUrl?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty({
    description: 'Attachment MIME type',
    required: false,
  })
  attachmentType?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  @ApiProperty({
    description: 'Original attachment file name',
    required: false,
  })
  attachmentName?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Server-side at-rest encryption envelope for the attachment blob',
    required: false,
  })
  attachmentEnvelope?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  @Validate(EnvelopeSizeConstraint)
  @ApiProperty({
    description:
      'E2EE envelope (MessageEnvelopeV1). When present, body is stored as null and the message is encrypted.',
    required: false,
  })
  envelope?: Record<string, unknown>;
}
