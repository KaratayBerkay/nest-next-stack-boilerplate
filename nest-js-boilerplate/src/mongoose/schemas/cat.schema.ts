import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

/**
 * #25/#108 Mongoose. Decorator-defined schema: `@Schema()` maps the class to the
 * `cats` collection, `@Prop()` defines each field. Scalar schema types are
 * inferred from TS metadata; arrays must be declared explicitly (`@Prop([String])`),
 * exactly as the docs note. `SchemaFactory.createForClass` builds the Mongoose schema.
 */
@Schema()
export class Cat {
  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;

  // Arrays can't be reflected from TS metadata — the element type is explicit.
  @Prop([String])
  tags: string[];
}

export const CatSchema = SchemaFactory.createForClass(Cat);
