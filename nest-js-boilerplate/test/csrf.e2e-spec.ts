import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CsrfModule } from '../src/csrf/csrf.module';

describe('CSRF (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CsrfModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a state-changing request with no CSRF token (403)', async () => {
    await request(app.getHttpServer())
      .post('/csrf/echo')
      .send({ hello: 'world' })
      .expect(403);
  });

  it('accepts the request when a valid token + cookie are presented', async () => {
    const agent = request.agent(app.getHttpServer());
    const tokenRes = await agent.get('/csrf/token').expect(200);
    const { token } = tokenRes.body as { token: string };

    const res = await agent
      .post('/csrf/echo')
      .set('x-csrf-token', token)
      .send({ hello: 'world' })
      .expect(201);
    expect((res.body as { received: { hello: string } }).received.hello).toBe(
      'world',
    );
  });
});
