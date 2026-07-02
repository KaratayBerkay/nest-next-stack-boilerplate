import { Directive, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Announcement {
  // The custom @upper directive (declared in buildSchemaOptions.directives and applied by
  // upperDirectiveTransformer) upper-cases this field's resolved value at query time.
  @Directive('@upper')
  @Field()
  headline: string;

  // Control field: no directive, so it is returned exactly as the resolver produced it.
  @Field()
  body: string;
}
