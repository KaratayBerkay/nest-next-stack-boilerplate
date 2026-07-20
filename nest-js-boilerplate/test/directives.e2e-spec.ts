import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import request from 'supertest';
import { DirectivesModule } from '../src/directives/directives.module';
import { upperDirectiveTransformer } from '../src/directives/upper-directive.transformer';

// Proves a custom code-first schema directive: the @upper directive (declared via
// buildSchemaOptions.directives and implemented by upperDirectiveTransformer) upper-cases
// the field it decorates at query time, while undecorated fields pass through untouched.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

describe('GraphQL directives (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
          transformSchema: (schema) =>
            upperDirectiveTransformer(schema, 'upper'),
          buildSchemaOptions: {
            directives: [
              new GraphQLDirective({
                name: 'upper',
                locations: [DirectiveLocation.FIELD_DEFINITION],
              }),
            ],
          },
        }),
        DirectivesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('upper-cases the @upper-decorated field and leaves others unchanged', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { announcement { headline body } }` });

    expect(res.status).toBe(200);
    const body = res.body as GqlResponse<{
      announcement: { headline: string; body: string };
    }>;
    expect(body.data!.announcement.headline).toBe('LAUNCH DAY'); // @upper applied
    expect(body.data!.announcement.body).toBe('see you there'); // no directive -> verbatim
  });
});
