import { Field, InputType } from '@nestjs/graphql';
import {
  IsIn,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, and underscores',
  })
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(280)
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['en', 'tr'])
  locale?: string;

  @Field({ nullable: true })
  @IsOptional()
  timezone?: string;
}
