import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'A cooking recipe' })
export class Recipe {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  preparationTimeMinutes: number;

  @Field(() => [String])
  ingredients: string[];
}
