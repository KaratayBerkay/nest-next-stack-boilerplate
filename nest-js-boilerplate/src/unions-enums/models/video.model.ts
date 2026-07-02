import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ResultCategory } from '../result-category.enum';

@ObjectType()
export class Video {
  @Field()
  title: string;

  @Field(() => Int)
  durationSeconds: number;

  @Field(() => ResultCategory)
  category: ResultCategory;
}
