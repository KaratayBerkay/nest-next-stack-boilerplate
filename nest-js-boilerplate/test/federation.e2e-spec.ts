/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { GatewayModule } from '../src/federation/gateway/gateway.module';

// Proves GraphQL federation end-to-end (docs.nestjs.com/graphql/federation): two real federated
// subgraphs (Users owns User; Posts owns Post and contributes User.posts) are composed by an Apollo
// gateway, and a single query resolves an entity ACROSS the subgraph boundary via @key +
// @ResolveReference. Self-contained: no database; subgraphs listen on ephemeral ports.
//
// Both code-first subgraphs declare an @ObjectType('User'), and NestJS registers GraphQL types in a
// GLOBAL TypeMetadataStorage — so building both in one process collides ("multiple types named
// User"). In production each subgraph is its own process; here we emulate that by building each
// inside an isolated module registry (its own @nestjs/graphql storage) so only one `User` is
// registered per build. The running HTTP servers then coexist and the gateway talks to them over HTTP.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

async function startSubgraph(
  build: () => Promise<INestApplication>,
): Promise<{ app: INestApplication; url: string }> {
  let app!: INestApplication;
  await jest.isolateModulesAsync(async () => {
    app = await build();
  });
  const { port } = (app.getHttpServer() as Server).address() as AddressInfo;
  return { app, url: `http://127.0.0.1:${port}/graphql` };
}

describe('GraphQL federation (e2e)', () => {
  let usersApp: INestApplication;
  let postsApp: INestApplication;
  let gatewayApp: INestApplication;

  beforeAll(async () => {
    const users = await startSubgraph(async () => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { Test } =
        require('@nestjs/testing') as typeof import('@nestjs/testing');
      const { UsersSubgraphModule } =
        require('../src/federation/users-subgraph/users-subgraph.module') as typeof import('../src/federation/users-subgraph/users-subgraph.module');
      /* eslint-enable @typescript-eslint/no-require-imports */
      const ref = await Test.createTestingModule({
        imports: [UsersSubgraphModule],
      }).compile();
      const app = ref.createNestApplication();
      await app.listen(0, '127.0.0.1');
      return app;
    });

    const posts = await startSubgraph(async () => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { Test } =
        require('@nestjs/testing') as typeof import('@nestjs/testing');
      const { PostsSubgraphModule } =
        require('../src/federation/posts-subgraph/posts-subgraph.module') as typeof import('../src/federation/posts-subgraph/posts-subgraph.module');
      /* eslint-enable @typescript-eslint/no-require-imports */
      const ref = await Test.createTestingModule({
        imports: [PostsSubgraphModule],
      }).compile();
      const app = ref.createNestApplication();
      await app.listen(0, '127.0.0.1');
      return app;
    });

    usersApp = users.app;
    postsApp = posts.app;

    const gatewayRef = await Test.createTestingModule({
      imports: [
        GatewayModule.forSubgraphs([
          { name: 'users', url: users.url },
          { name: 'posts', url: posts.url },
        ]),
      ],
    }).compile();
    gatewayApp = gatewayRef.createNestApplication();
    await gatewayApp.init();
  }, 60000);

  afterAll(async () => {
    // Draining three Apollo/HTTP servers (gateway + 2 subgraphs) can exceed the default 5s hook
    // timeout, so extend it.
    await gatewayApp?.close();
    await postsApp?.close();
    await usersApp?.close();
  }, 30000);

  const gql = async <T>(query: string) => {
    const res = await request(gatewayApp.getHttpServer())
      .post('/graphql')
      .send({ query });
    return { status: res.status, body: res.body as GqlResponse<T> };
  };

  it('resolves a Post (posts subgraph) together with its author (users subgraph) through the gateway', async () => {
    const { status, body } = await gql<{
      getPosts: {
        id: string;
        title: string;
        user: { id: string; name: string; email: string };
      }[];
    }>(`query { getPosts { id title user { id name email } } }`);

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    const posts = body.data!.getPosts;
    expect(posts).toHaveLength(3);

    // Post #101 is owned by the posts subgraph; its author's name/email come from the users subgraph
    // via @ResolveReference — only possible because the gateway stitched the two together.
    const post = posts.find((p) => p.id === '101')!;
    expect(post.user).toEqual({
      id: '1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  });

  it('resolves a User (users subgraph) together with its posts (posts subgraph) through the gateway', async () => {
    const { status, body } = await gql<{
      getUser: {
        id: string;
        name: string;
        posts: { id: string; title: string }[];
      };
    }>(`query { getUser(id: 2) { id name posts { id title } } }`);

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    const user = body.data!.getUser;
    expect(user.name).toBe('Alan Turing');
    // `posts` is contributed by the posts subgraph to the User entity owned by the users subgraph.
    expect(user.posts.map((p) => p.id).sort()).toEqual(['102', '103']);
  });
});
