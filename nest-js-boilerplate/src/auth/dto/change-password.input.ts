import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword!: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
