import { Field, ObjectType } from '@nestjs/graphql';

// A model shared between the GraphQL API and a frontend bundle (docs.nestjs.com/graphql/sharing-
// models). It imports only decorator names from `@nestjs/graphql`; in a frontend build those are
// aliased to `@nestjs/graphql/dist/extra/graphql-model-shim`, where they are no-ops — so the class
// ships to the browser as plain TypeScript with zero GraphQL runtime/metadata cost.
@ObjectType()
export class SharedProduct {
  @Field()
  name: string;

  @Field()
  priceCents: number;

  // Shared domain logic — reused identically by the resolver (backend) and the frontend bundle.
  discountedCents(percentOff: number): number {
    return Math.round(this.priceCents * (1 - percentOff / 100));
  }
}
