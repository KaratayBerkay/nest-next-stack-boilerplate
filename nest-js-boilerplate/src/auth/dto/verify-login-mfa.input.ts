import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Length } from 'class-validator';

@InputType()
export class VerifyLoginMfaInput {
  @Field()
  @IsNotEmpty()
  mfaToken!: string;

  @Field()
  @Length(6, 8)
  code!: string;
}
