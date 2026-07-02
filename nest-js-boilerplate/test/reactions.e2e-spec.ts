import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { gql, registerAndLogin } from './utils/auth';

// Proves the Reaction resolver end-to-end over GraphQL: traverses FK depth
// (Reaction -> Post -> User) via the JWT user + a flat postId, behind the JWT guard.
// Reaction has no schema-generated validators, so this asserts wiring (and the hand-written
// @IsUUID) rather than a generated validator. Requires Postgres + Redis (docker compose up -d).
describe('Reactions GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let postId: string;

  const clearDb = async () => {
    await prisma.reaction.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await clearDb();

    const auth = await registerAndLogin(app);
    token = auth.accessToken;
    userId = auth.userId;

    // Seed the FK target: a Post authored by the user.
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        title: 'Hello World',
        slug: `hello-${Date.now()}`,
        content: 'first post',
      },
    });
    postId = post.id;
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  it('requires a bearer token (JwtAuthGuard)', async () => {
    const denied = await gql(app, `{ reactions { id } }`);
    expect(denied.errors).toBeDefined();
  });

  it('creates a Reaction on a Post (Reaction->Post->User FK chain)', async () => {
    const body = await gql<{
      createReaction: {
        id: string;
        type: string;
        postId: string;
        userId: string;
      };
    }>(
      app,
      `mutation { createReaction(data: { type: LIKE, postId: "${postId}" }) {
        id type postId userId } }`,
      token,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data!.createReaction).toMatchObject({
      type: 'LIKE',
      postId,
      userId,
    });
  });

  it('rejects a non-UUID postId via @IsUUID', async () => {
    const body = await gql(
      app,
      `mutation { createReaction(data: { type: LOVE, postId: "not-a-uuid" }) { id } }`,
      token,
    );
    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/postId|uuid/i);
  });

  it('lists reactions for an authenticated caller', async () => {
    const body = await gql<{ reactions: { id: string; type: string }[] }>(
      app,
      `{ reactions { id type } }`,
      token,
    );
    expect(body.errors).toBeUndefined();
    expect(body.data!.reactions.length).toBeGreaterThanOrEqual(1);
  });
});
