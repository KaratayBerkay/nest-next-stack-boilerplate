import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsUUID()
  postId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  body!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
