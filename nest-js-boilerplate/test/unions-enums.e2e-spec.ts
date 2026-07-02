import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UnionsEnumsModule } from '../src/unions-enums/unions-enums.module';

// Proves GraphQL unions + enums end-to-end: a union query resolves each member to its
// concrete type (inline fragments + __typename), an enum is returned as an output field,
// and an enum is accepted as an input argument to filter the results.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type Result = {
  __typename: string;
  headline?: string;
  title?: string;
  durationSeconds?: number;
  category: string;
};

describe('GraphQL unions and enums (e2e)', () => {
  let app: INestApplication;

  const search = async (variables?: Record<string, unknown>) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query Search($category: ResultCategory) {
          search(category: $category) {
            __typename
            ... on Article { headline category }
            ... on Video { title durationSeconds category }
          }
        }`,
        variables,
      });
    return res.body as GqlResponse<{ search: Result[] }>;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        UnionsEnumsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('resolves each union member to its concrete type and serializes the enum field', async () => {
    const body = await search();
    const items = body.data!.search;

    const article = items.find((i) => i.__typename === 'Article');
    const video = items.find((i) => i.__typename === 'Video');

    expect(article).toMatchObject({
      headline: 'Markets rally',
      category: 'NEWS',
    });
    expect(video).toMatchObject({
      title: 'Funny cats',
      durationSeconds: 200,
      category: 'ENTERTAINMENT', // enum serialized as its name
    });
  });

  it('accepts the enum as an input argument to filter the union', async () => {
    const body = await search({ category: 'ENTERTAINMENT' });
    const items = body.data!.search;

    expect(items).toHaveLength(1);
    expect(items[0].__typename).toBe('Video');
    expect(items[0].category).toBe('ENTERTAINMENT');
  });
});
