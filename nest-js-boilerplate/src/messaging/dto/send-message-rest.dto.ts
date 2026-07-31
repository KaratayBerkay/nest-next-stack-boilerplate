import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageRestDto {
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({
    description: 'Message body (required when no attachment is sent)',
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
}
