import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class OAuthProfileInput {
  @Field(() => String)
  @IsString()
  type!: string;

  @Field(() => String)
  @IsString()
  provider!: string;

  @Field(() => String)
  @IsString()
  providerAccountId!: string;

  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(80)
  name?: string | null;
}
