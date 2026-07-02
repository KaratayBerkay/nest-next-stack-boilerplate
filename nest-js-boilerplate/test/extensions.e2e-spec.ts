import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ExtensionsModule } from '../src/extensions/extensions.module';

// Proves GraphQL @Extensions field metadata end-to-end: `apiToken` carries `@Extensions({ role:
// ADMIN })`, and checkRoleMiddleware reads that metadata back from the field's schema config to
// gate access. An ADMIN caller sees the field; a USER caller is denied; the unrestricted
// `username` field is always readable. Self-contained (no database).
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type SecuredAccount = {
  username: string;
  apiToken: string;
};

describe('GraphQL extensions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        ExtensionsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  const gql = async <T>(query: string, role?: string) => {
    const req = request(app.getHttpServer()).post('/graphql');
    if (role) req.set('x-role', role);
    const res = await req.send({ query });
    return { status: res.status, body: res.body as GqlResponse<T> };
  };

  it('lets an ADMIN caller read the role-gated field', async () => {
    const { status, body } = await gql<{ account: SecuredAccount }>(
      `query { account { username apiToken } }`,
      'ADMIN',
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data!.account).toEqual({
      username: 'ada',
      apiToken: 'tok_live_secret',
    });
  });

  it('denies a USER caller the role-gated field (metadata enforced)', async () => {
    const { body } = await gql<{ account: SecuredAccount } | null>(
      `query { account { username apiToken } }`,
      'USER',
    );

    // apiToken is non-null and errors, so the error bubbles up through the non-null `account`
    // query field and nulls the whole `data`.
    expect(body.data).toBeNull();
    expect(body.errors?.[0]?.message).toMatch(/sufficient permissions/i);
  });

  it('always allows the unrestricted field (no @Extensions metadata)', async () => {
    const { status, body } = await gql<{ account: { username: string } }>(
      `query { account { username } }`,
      'USER',
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data!.account.username).toBe('ada');
  });
});
