import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class SendMessageInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Recipient user ID' })
  recipientId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @ApiProperty({ description: 'Message body', maxLength: 5000 })
  text!: string;
}
