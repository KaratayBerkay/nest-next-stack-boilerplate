import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  token!: string;

  @Field()
  @MinLength(8)
  @MaxLength(100)
  newPassword!: string;
}
