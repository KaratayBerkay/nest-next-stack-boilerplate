// fallow-ignore-next-line circular-dependency — GraphQL interface/implementation cycle
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Media } from './media.model';

@ObjectType({ implements: () => [Media] })
export class Podcast implements Media {
  id: string;
  title: string;

  @Field(() => Int)
  episodeCount: number;
}
