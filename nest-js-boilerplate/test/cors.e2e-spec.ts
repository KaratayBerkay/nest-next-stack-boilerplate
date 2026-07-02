import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CorsModule } from '../src/cors/cors.module';

describe('CORS (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CorsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Mirrors app.enableCors() in main.ts.
    app.enableCors({ origin: true, credentials: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reflects the Origin and allows credentials on an actual request', async () => {
    const res = await request(app.getHttpServer())
      .get('/cors/ping')
      .set('Origin', 'https://example.com')
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://example.com',
    );
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('answers a CORS preflight (OPTIONS) request', async () => {
    const res = await request(app.getHttpServer())
      .options('/cors/ping')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://example.com',
    );
  });
});
