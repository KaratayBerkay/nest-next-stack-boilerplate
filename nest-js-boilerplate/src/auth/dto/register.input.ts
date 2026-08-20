import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsTimeZone,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_COMPLEXITY_REGEX } from '../password-policy';

// Slim, purpose-built input — not the giant generated UserCreateInput. The boilerplate
// keeps auth inputs hand-written so the public API surface stays intentional.
@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
