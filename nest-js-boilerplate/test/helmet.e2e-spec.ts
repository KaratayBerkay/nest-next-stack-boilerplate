/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import helmet from 'helmet';
import request from 'supertest';
import { CorsModule } from '../src/cors/cors.module';

// Helmet is applied app-wide in main.ts; this proves the security headers it sets (and the
// removal of x-powered-by) using a lightweight controller.
describe('Helmet (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CorsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(helmet());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sets security headers and strips x-powered-by', async () => {
    const res = await request(app.getHttpServer())
      .get('/cors/ping')
      .expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
