import { TypeMetadataStorage } from '@nestjs/graphql';
import { SharedProduct } from './models/shared-product.model';

type ProductModule = typeof import('./models/shared-product.model');

// Proves the documented "sharing models" behaviour (docs.nestjs.com/graphql/sharing-models): the
// SAME model class powers the GraphQL API (real decorators register a schema type) and a frontend
// bundle (the `graphql-model-shim` aliases `@nestjs/graphql` so the decorators become no-ops and
// the class carries no GraphQL runtime).
describe('sharing models (graphql-model-shim)', () => {
  afterEach(() => {
    jest.dontMock('@nestjs/graphql');
    jest.resetModules();
  });

  it('backend half: the real decorators register SharedProduct as a GraphQL object type', () => {
    const registered = TypeMetadataStorage.getObjectTypesMetadata();
    expect(registered.some((t) => t.target === SharedProduct)).toBe(true);
  });

  it('frontend half: aliased to the shim, the decorators are no-ops and the class stays plain & usable', () => {
    // Replicates the docs' webpack alias inside the test: @nestjs/graphql -> the model shim.
    jest.resetModules();
    jest.doMock('@nestjs/graphql', () =>
      jest.requireActual<Record<string, unknown>>(
        '@nestjs/graphql/dist/extra/graphql-model-shim',
      ),
    );

    // Load the model the way a shim-aliased frontend bundle would (jest's require honours doMock).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const shimmed = require('./models/shared-product.model') as ProductModule;
    const product = new shimmed.SharedProduct();
    product.name = 'Widget';
    product.priceCents = 1000;

    // The shared domain logic runs identically with zero GraphQL runtime behind it.
    expect(product.discountedCents(10)).toBe(900);

    // Loading through the shim registered NO GraphQL type (the @ObjectType decorator was a no-op):
    // the real metadata storage never sees this shim-loaded class object.
    const registered = TypeMetadataStorage.getObjectTypesMetadata();
    expect(registered.some((t) => t.target === shimmed.SharedProduct)).toBe(
      false,
    );
  });
});
