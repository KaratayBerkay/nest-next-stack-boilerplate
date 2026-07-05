import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsOptional,
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';
import { ReactionType } from '../../@generated/prisma/reaction-type.enum';

@ValidatorConstraint({ name: 'exactlyOneOfPostOrComment', async: false })
class ExactlyOneOfPostOrComment implements ValidatorConstraintInterface {
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const obj = args?.object as CreateReactionInput;
    return (obj.postId !== undefined) !== (obj.commentId !== undefined);
  }

  defaultMessage(): string {
    return 'Exactly one of postId or commentId must be provided';
  }
}

@InputType()
export class CreateReactionInput {
  @Field(() => ReactionType)
  @IsEnum(ReactionType)
  @Validate(ExactlyOneOfPostOrComment)
  type!: `${ReactionType}`;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  commentId?: string;
}
