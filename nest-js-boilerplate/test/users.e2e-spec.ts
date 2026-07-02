import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Proves: GraphQL (code-first) works end-to-end against Postgres via Prisma, AND that the
// validation auto-generated from the Prisma schema (@Validator.IsEmail on UserCreateInput)
// is actually enforced.
interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

describe('Users GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const gql = async <T>(query: string): Promise<GqlResponse<T>> => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);
    return res.body as GqlResponse<T>;
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
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('creates a user with valid input', async () => {
    const body = await gql<{
      createUser: { id: number; email: string; name: string | null };
    }>(
      'mutation { createUser(data: { email: "alice@example.com", name: "Alice" }) { id email name } }',
    );

    expect(body.errors).toBeUndefined();
    expect(body.data?.createUser).toMatchObject({
      email: 'alice@example.com',
      name: 'Alice',
    });
  });

  it('rejects an invalid email via the schema-generated @IsEmail validator', async () => {
    const body = await gql(
      'mutation { createUser(data: { email: "not-an-email", name: "Bob" }) { id } }',
    );

    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/email/i);
  });

  it('lists users', async () => {
    const body = await gql<{ users: { id: number; email: string }[] }>(
      '{ users { id email name } }',
    );

    expect(body.errors).toBeUndefined();
    expect(body.data?.users.length).toBeGreaterThanOrEqual(1);
  });
});
