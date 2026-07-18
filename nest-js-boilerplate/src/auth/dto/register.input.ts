import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsTimeZone,
  MaxLength,
  MinLength,
} from 'class-validator';

// Slim, purpose-built input — not the giant generated UserCreateInput. The boilerplate
// keeps auth inputs hand-written so the public API surface stays intentional.
@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  @MaxLength(100)
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
