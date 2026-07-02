import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import compression from 'compression';
import request from 'supertest';
import { CompressionModule } from '../src/compression/compression.module';

describe('Compression (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CompressionModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Mirrors the global compression() registered in main.ts.
    app.use(compression());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('gzip-compresses a large response when the client accepts it', async () => {
    const res = await request(app.getHttpServer())
      .get('/compression/payload')
      .set('Accept-Encoding', 'gzip')
      .expect(200);
    expect(res.headers['content-encoding']).toBe('gzip');
    // superagent transparently decodes gzip, so the payload is intact.
    expect((res.body as { items: string[] }).items.length).toBe(500);
  });
});
