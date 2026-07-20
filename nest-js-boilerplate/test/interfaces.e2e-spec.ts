import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InterfacesModule } from '../src/interfaces/interfaces.module';

// Proves GraphQL interfaces end-to-end: a query typed as the Media interface returns a
// heterogeneous list, and resolveType maps each element to its concrete object type so
// inline fragments (... on Movie / ... on Podcast) and __typename resolve correctly.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type MediaItem = {
  __typename: string;
  id: string;
  title: string;
  durationMinutes?: number;
  episodeCount?: number;
};

describe('GraphQL interfaces (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        InterfacesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('resolves concrete types behind the interface via resolveType', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query {
          mediaLibrary {
            __typename
            id
            title
            ... on Movie { durationMinutes }
            ... on Podcast { episodeCount }
          }
        }`,
      });

    expect(res.status).toBe(200);
    const body = res.body as GqlResponse<{ mediaLibrary: MediaItem[] }>;
    const items = body.data!.mediaLibrary;

    const movie = items.find((i) => i.__typename === 'Movie');
    const podcast = items.find((i) => i.__typename === 'Podcast');

    expect(movie).toMatchObject({
      id: '1',
      title: 'Inception',
      durationMinutes: 148,
    });
    expect(movie?.episodeCount).toBeUndefined(); // Movie has no episodeCount field
    expect(podcast).toMatchObject({
      id: '2',
      title: 'Syntax',
      episodeCount: 700,
    });
    expect(podcast?.durationMinutes).toBeUndefined();
  });
});
