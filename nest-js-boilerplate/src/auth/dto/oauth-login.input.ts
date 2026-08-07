import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class OAuthLoginInput {
  @Field(() => String)
  @IsString()
  state!: string;
}
