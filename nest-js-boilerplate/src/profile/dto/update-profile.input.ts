import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
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

  /** Chat-room display name override (presence lists + room messages only). */
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(30)
  chatNickname?: string;

  /** Whether chatNickname is actually used in chat rooms, independent of
   *  whether one is saved — toggling this off must not erase chatNickname. */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  useNickname?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatarUrl?: string;

  /** When true, avatarUrl is withheld from every other-user-facing query. */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hideAvatar?: boolean;

  /** Owner's own preference — encrypts DMs/room messages this device sends. */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  e2eeEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['en', 'tr'])
  locale?: string;

  @Field({ nullable: true })
  @IsOptional()
  timezone?: string;
}
