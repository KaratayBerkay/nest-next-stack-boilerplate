import { Field, ObjectType } from '@nestjs/graphql';
import {
  doubleMiddleware,
  exclaimMiddleware,
  maskMiddleware,
  prefixFieldNameMiddleware,
} from '../field.middleware';

@ObjectType()
export class SecretProfile {
  // Transformed by a single middleware.
  @Field({ middleware: [maskMiddleware] })
  apiKey: string;

  // Middleware that reaches into ctx.info.
  @Field({ middleware: [prefixFieldNameMiddleware] })
  greeting: string;

  // Two middlewares — order-sensitive (double is outermost, exclaim innermost).
  @Field({ middleware: [doubleMiddleware, exclaimMiddleware] })
  chant: string;

  // Control: no middleware, returned verbatim.
  @Field()
  plain: string;
}
