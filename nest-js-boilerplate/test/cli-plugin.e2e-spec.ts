import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CliPluginModule } from '../src/cli-plugin/cli-plugin.module';

// Proves the @nestjs/graphql CLI plugin (docs.nestjs.com/graphql/cli-plugin): the `Book` model has
// NO @Field decorators, yet the schema exposes its fields with types inferred from the TS types and
// descriptions from the JSDoc comments — because the plugin's AST transformer ran during
// compilation (test/graphql-plugin.transformer.js, wired via test/jest-cli-plugin.json). If the
// transformer had NOT run, `type Book` would have zero fields and the schema build would fail.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

// A trimmed slice of an introspection result.
type IntrospectedType = {
  name: string;
  description: string | null;
  fields: { name: string; description: string | null; type: unknown }[] | null;
};

describe('GraphQL CLI plugin (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        CliPluginModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  const gql = async <T>(query: string) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query });
    return { status: res.status, body: res.body as GqlResponse<T> };
  };

  it('returns a Book whose fields the plugin auto-generated (no @Field in source)', async () => {
    const { status, body } = await gql<{ book: Record<string, unknown> }>(
      `query { book { id title subtitle inPrint } }`,
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data!.book).toEqual({
      id: 1,
      title: 'Nest in Action',
      subtitle: 'GraphQL edition',
      inPrint: true,
    });
  });

  it('inferred each field type and pulled descriptions from the JSDoc comments', async () => {
    const { body } = await gql<{ __type: IntrospectedType }>(`
      query {
        __type(name: "Book") {
          name
          description
          fields {
            name
            description
            type { kind name ofType { kind name ofType { kind name } } }
          }
        }
      }
    `);

    const type = body.data!.__type;
    // @ObjectType description came from the class JSDoc (introspectComments).
    expect(type.description).toBe('A book in the catalog.');

    const byName = Object.fromEntries(
      (type.fields ?? []).map((f) => [f.name, f]),
    );
    // The plugin added a @Field for every property.
    expect(Object.keys(byName).sort()).toEqual([
      'id',
      'inPrint',
      'subtitle',
      'title',
    ]);
    // Field-level descriptions from JSDoc.
    expect(byName.title.description).toBe("The book's title.");
    expect(byName.subtitle.description).toBe('Optional subtitle.');

    // Types inferred from TS: `string` -> NON_NULL String, optional `subtitle?` -> nullable String,
    // `number` -> Float, `boolean` -> NON_NULL Boolean.
    expect(byName.title.type).toMatchObject({
      kind: 'NON_NULL',
      ofType: { name: 'String' },
    });
    expect(byName.subtitle.type).toMatchObject({
      kind: 'SCALAR',
      name: 'String',
    });
    expect(byName.id.type).toMatchObject({
      kind: 'NON_NULL',
      ofType: { name: 'Float' },
    });
    expect(byName.inPrint.type).toMatchObject({
      kind: 'NON_NULL',
      ofType: { name: 'Boolean' },
    });
  });
});
