import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Color } from '../color';

// One object type exercising three scalar flavours at once:
//  - `color`     -> our class-based custom scalar (Color), resolved by inference
//  - `metadata`  -> a third-party scalar (graphql-type-json's GraphQLJSON)
//  - `createdAt` -> a built-in scalar (GraphQLISODateTime, the default Date mapping)
@ObjectType()
export class Swatch {
  @Field(() => Int)
  id: number;

  @Field()
  color: Color;

  @Field(() => GraphQLJSON)
  metadata: Record<string, unknown>;

  @Field()
  createdAt: Date;
}
