/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PluginsModule } from '../src/plugins/plugins.module';

// Proves a custom Apollo Server plugin runs inside the request lifecycle: MetricsPlugin's
// requestDidStart / willSendResponse hooks write to a DI service, which a `metrics` query
// reads back. Self-contained (GraphQLModule + the feature module), so no database is needed.
interface GqlResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

type Metrics = {
  requestCount: number;
  completedCount: number;
  lastOperationName: string | null;
};

describe('GraphQL Apollo plugins (e2e)', () => {
  let app: INestApplication;

  const gql = async <T>(query: string) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query });
    return res.body as GqlResponse<T>;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
        }),
        PluginsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('observes requests via requestDidStart/willSendResponse hooks', async () => {
    // A named operation the plugin should fully observe (start + willSendResponse).
    const ping = await gql<{ ping: string }>(`query Ping { ping }`);
    expect(ping.data!.ping).toBe('pong');

    // Now read what the plugin captured. By the time this resolver runs, the plugin has
    // started this request too and has completed "Ping".
    const snapshot = await gql<{ metrics: Metrics }>(
      `query Stats { metrics { requestCount completedCount lastOperationName } }`,
    );
    const metrics = snapshot.data!.metrics;

    expect(metrics.requestCount).toBeGreaterThanOrEqual(2); // Ping + this Stats request
    expect(metrics.completedCount).toBeGreaterThanOrEqual(1); // Ping finished
    expect(metrics.lastOperationName).toBe('Ping'); // captured in willSendResponse
  });
});
