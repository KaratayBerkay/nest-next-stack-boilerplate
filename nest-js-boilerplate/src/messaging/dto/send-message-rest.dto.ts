import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageRestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @ApiProperty({ description: 'Message body', maxLength: 5000 })
  text!: string;
}
