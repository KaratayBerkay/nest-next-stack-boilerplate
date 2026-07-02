import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @Field()
  @IsString()
  @MinLength(1)
  content!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
