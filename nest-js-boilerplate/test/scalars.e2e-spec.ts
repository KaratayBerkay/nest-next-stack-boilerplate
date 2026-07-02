import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ScalarsModule } from '../src/scalars/scalars.module';

// Proves GraphQL scalars end-to-end: a class-based custom scalar (Color, serialize +
// parseValue + parseLiteral + validation), a third-party scalar (GraphQLJSON) and a
// built-in scalar (GraphQLISODateTime / Date). Self-contained: GraphQLModule + the feature
// module only, so no database is needed.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type Swatch = {
  id?: number;
  color: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

describe('GraphQL scalars (e2e)', () => {
  let app: INestApplication;

  const gql = async <T>(query: string, variables?: Record<string, unknown>) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });
    return { status: res.status, body: res.body as GqlResponse<T> };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        ScalarsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serializes custom, JSON and ISO-date scalars on the way out', async () => {
    const { status, body } = await gql<{ swatch: Swatch }>(`
      query {
        swatch { id color metadata createdAt }
      }
    `);

    expect(status).toBe(200);
    const swatch = body.data!.swatch;
    expect(swatch.color).toBe('#1a2b3c'); // Color.serialize -> hex
    expect(swatch.metadata).toEqual({ tags: ['brand', 'primary'], score: 9.5 }); // GraphQLJSON
    expect(new Date(swatch.createdAt!).toISOString()).toBe(
      '2026-06-23T10:00:00.000Z',
    ); // built-in ISO date scalar
  });

  it('parses a custom scalar from a variable (parseValue) and serializes the result', async () => {
    const { status, body } = await gql<{ lighten: Swatch }>(
      `mutation ($color: Color!, $amount: Int!) {
        lighten(color: $color, amount: $amount) { color metadata }
      }`,
      { color: '#1a2b3c', amount: 16 },
    );

    expect(status).toBe(200);
    const swatch = body.data!.lighten;
    // 0x1a+16=0x2a, 0x2b+16=0x3b, 0x3c+16=0x4c — only reachable if the arg became a Color.
    expect(swatch.color).toBe('#2a3b4c');
    expect(swatch.metadata).toEqual({ from: '#1a2b3c', amount: 16 });
  });

  it('parses a custom scalar from an inline literal (parseLiteral)', async () => {
    const { status, body } = await gql<{ lighten: Swatch }>(`
      mutation {
        lighten(color: "#1a2b3c", amount: 16) { color }
      }
    `);

    expect(status).toBe(200);
    expect(body.data!.lighten.color).toBe('#2a3b4c');
  });

  it('rejects an invalid custom-scalar value with a GraphQL error', async () => {
    const { body } = await gql<{ lighten: Swatch }>(
      `mutation ($color: Color!) {
        lighten(color: $color) { color }
      }`,
      { color: 'not-a-hex-color' },
    );

    expect(body.data == null).toBe(true);
    expect(body.errors?.[0]?.message).toMatch(/Invalid color/i);
  });
});
