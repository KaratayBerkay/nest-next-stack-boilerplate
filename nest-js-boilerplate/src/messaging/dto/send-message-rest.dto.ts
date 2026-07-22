import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageRestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @ApiProperty({ description: 'Message body', maxLength: 5000 })
  text!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Client-generated temp ID for optimistic reconciliation',
    required: false,
  })
  _tempId?: string;
}
