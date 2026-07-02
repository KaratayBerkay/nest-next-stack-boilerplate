import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GraphqlOtherModule } from '../src/graphql-other/graphql-other.module';

// Proves the GraphQL "other features" (docs.nestjs.com/graphql/other-features): a guard reading
// args via GqlExecutionContext, a custom param decorator (@Selection) reading the GraphQL `info`,
// and an interceptor that fires at both the root @Query and a @ResolveField (the latter only
// because `fieldResolverEnhancers: ['interceptors']` is set). Self-contained: no database.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type Trace = { parentType: string; field: string; atFieldLevel: boolean };

describe('GraphQL other features (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
          fieldResolverEnhancers: ['interceptors'], // mirror the root config
        }),
        GraphqlOtherModule,
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

  it('runs a query, a @ResolveField, the @Selection decorator, and the field-level interceptor', async () => {
    const { status, body } = await gql<{
      report: { id: number; title: string; summary: string };
    }>(`query { report(id: 7) { id title summary } }`);

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data!.report).toEqual({
      id: 7,
      title: 'Report #7',
      summary: 'summary of Report #7', // @ResolveField resolved
    });

    // @Selection captured the sub-fields the client asked for on `report`.
    const selection = await gql<{ reportSelection: string[] }>(
      `query { reportSelection }`,
    );
    expect(selection.body.data!.reportSelection).toEqual([
      'id',
      'title',
      'summary',
    ]);

    // The interceptor fired for the root query (Query.report) AND the field resolver
    // (Report.summary) — the latter proves fieldResolverEnhancers + isResolvingGraphQLField.
    const traced = await gql<{ traces: Trace[] }>(
      `query { traces { parentType field atFieldLevel } }`,
    );
    const traces = traced.body.data!.traces;
    expect(traces).toContainEqual({
      parentType: 'Query',
      field: 'report',
      atFieldLevel: false,
    });
    expect(traces).toContainEqual({
      parentType: 'Report',
      field: 'summary',
      atFieldLevel: true,
    });
  });

  it('lets the GraphQL guard reject a bad argument (getArgs path)', async () => {
    const { body } = await gql<{ report: unknown } | null>(
      `query { report(id: -1) { id } }`,
    );

    expect(body.data).toBeNull();
    expect(body.errors?.[0]?.message).toMatch(/forbidden/i);
  });
});
