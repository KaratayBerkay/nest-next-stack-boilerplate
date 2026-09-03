import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsTimeZone,
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

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['en', 'tr'])
  locale?: string;

  /** Same IANA-zone rule register/login already enforce — this value is
   *  persisted and hydrated into the session snapshot, so it must not be
   *  the one place an arbitrary string can get in. */
  @Field({ nullable: true })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
