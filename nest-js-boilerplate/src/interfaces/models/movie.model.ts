import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Media } from './media.model';

// Concrete implementer. `implements: () => [Media]` (a thunk, so the circular import with
// media.model is safe) makes this type satisfy the Media interface in the schema; `id`/
// `title` are inherited from the interface, so only the type-specific field is decorated.
@ObjectType({ implements: () => [Media] })
export class Movie implements Media {
  id: string;
  title: string;

  @Field(() => Int)
  durationMinutes: number;
}
