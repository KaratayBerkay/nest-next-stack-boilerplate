/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InjectionScopesModule } from '../src/injection-scopes/injection-scopes.module';

// Proves REQUEST scope over real HTTP: a fresh instance per request, the injected REQUEST object,
// and the scope bubbling up to the controller (which depends on the request-scoped service).
describe('Injection scopes — REQUEST (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [InjectionScopesModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a new request-scoped instance per request and injects REQUEST', async () => {
    const first = await request(app.getHttpServer())
      .get('/scopes/request')
      .set('x-tenant-id', 'acme')
      .expect(200);
    const second = await request(app.getHttpServer())
      .get('/scopes/request')
      .set('x-tenant-id', 'globex')
      .expect(200);

    const firstBody = first.body as { instanceId: string; tenant: string };
    const secondBody = second.body as { instanceId: string; tenant: string };

    // @Inject(REQUEST) gave each instance access to its own request's headers.
    expect(firstBody.tenant).toBe('acme');
    expect(secondBody.tenant).toBe('globex');

    // A new instance per request → different instanceId (REQUEST scope, bubbled to the controller).
    expect(firstBody.instanceId).not.toBe(secondBody.instanceId);
  });
});
