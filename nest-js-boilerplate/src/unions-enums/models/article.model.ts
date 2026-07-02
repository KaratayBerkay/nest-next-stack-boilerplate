import { Field, ObjectType } from '@nestjs/graphql';
import { ResultCategory } from '../result-category.enum';

@ObjectType()
export class Article {
  @Field()
  headline: string;

  @Field(() => ResultCategory)
  category: ResultCategory;
}
