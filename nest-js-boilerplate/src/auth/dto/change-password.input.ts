import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_COMPLEXITY_REGEX } from '../password-policy';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword!: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message:
      'newPassword must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword!: string;
}
