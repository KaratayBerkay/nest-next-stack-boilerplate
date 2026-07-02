import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReactionType } from '../../@generated/prisma/reaction-type.enum';

// Slim input: the target (post/comment) is a flat, validated scalar id, and the reacting user
// comes from the JWT. Reaction has no schema `/// @Validator` rules, so this spec proves
// GraphQL + FK depth (Reaction -> Post -> User) + the JWT guard rather than generated validators.
@InputType()
export class CreateReactionInput {
  @Field(() => ReactionType)
  @IsEnum(ReactionType)
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
