import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ComplexityModule } from '../src/complexity/complexity.module';
import { ComplexityPlugin } from '../src/complexity/complexity.plugin';

// Proves GraphQL query-complexity enforcement: the ComplexityPlugin computes a cost from
// the query (here count * child cost) and rejects anything over the budget (20) before the
// resolver runs. Self-contained (GraphQLModule + the feature module), so no database needed.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

describe('GraphQL query complexity (e2e)', () => {
  let app: INestApplication;

  const items = async (count: number) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { items(count: ${count}) { name } }` });
    return res.body as GqlResponse<{ items: { name: string }[] }>;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        ComplexityModule,
      ],
      // The plugin lives at the root scope so it can inject GraphQLModule's GraphQLSchemaHost.
      providers: [ComplexityPlugin],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('allows a query under the complexity budget', async () => {
    const body = await items(3); // cost 3 <= 20
    expect(body.errors).toBeUndefined();
    expect(body.data!.items).toHaveLength(3);
  });

  it('rejects a query over the complexity budget before resolving', async () => {
    const body = await items(100); // cost 100 > 20
    expect(body.data).toBeFalsy();
    expect(body.errors?.[0]?.message).toMatch(/too complex: 100/i);
  });
});
