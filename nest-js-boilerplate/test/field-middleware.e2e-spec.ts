import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { FieldMiddlewareModule } from '../src/field-middleware/field-middleware.module';

// Proves GraphQL field middleware end-to-end: per-field middleware transforms the resolved
// value, can read ctx.info, and runs in the documented order (first listed = outermost).
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type Profile = {
  apiKey: string;
  greeting: string;
  chant: string;
  plain: string;
};

describe('GraphQL field middleware (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        FieldMiddlewareModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('transforms fields, reads ctx.info, and respects middleware order', async () => {
    const res = await request(app.getHttpServer()).post('/graphql').send({
      query: `query { secretProfile { apiKey greeting chant plain } }`,
    });

    expect(res.status).toBe(200);
    const body = res.body as GqlResponse<{ secretProfile: Profile }>;
    const profile = body.data!.secretProfile;

    // maskMiddleware: keep last 4 of "sk_live_ABCDEFGH" (16 chars) -> 12 stars + "EFGH".
    expect(profile.apiKey).toBe('************EFGH');
    // prefixFieldNameMiddleware: reaches ctx.info.fieldName.
    expect(profile.greeting).toBe('greeting:hello');
    // [double, exclaim] on "hi": exclaim (inner) -> "hi!", double (outer) -> "hi!hi!".
    expect(profile.chant).toBe('hi!hi!');
    // No middleware -> verbatim.
    expect(profile.plain).toBe('untouched');
  });
});
