import { Field, ObjectType } from '@nestjs/graphql';

// What the FieldTraceInterceptor recorded for one resolved field.
@ObjectType()
export class Trace {
  @Field()
  parentType: string;

  @Field()
  field: string;

  @Field()
  atFieldLevel: boolean;
}
