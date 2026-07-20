/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  INestApplication,
  VersioningOptions,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { VersioningModule } from '../src/versioning/versioning.module';

// Build a fresh app with versioning enabled for a single type. Versioning is an app-level setting,
// so each type gets its own isolated instance.
async function createApp(
  options: VersioningOptions,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [VersioningModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.enableVersioning(options);
  await app.init();
  return app;
}

describe('Versioning (e2e)', () => {
  describe('URI Versioning (default `v` prefix)', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp({ type: VersioningType.URI });
    });
    afterAll(async () => app.close());

    it('routes /v1/cats and /v2/cats to the matching controller version', async () => {
      await request(app.getHttpServer())
        .get('/v1/cats')
        .expect(200, { resource: 'cats', version: '1' });
      await request(app.getHttpServer())
        .get('/v2/cats')
        .expect(200, { resource: 'cats', version: '2' });
    });

    it('honours route-level @Version on /dogs', async () => {
      await request(app.getHttpServer())
        .get('/v1/dogs')
        .expect(200, { resource: 'dogs', version: '1' });
      await request(app.getHttpServer())
        .get('/v2/dogs')
        .expect(200, { resource: 'dogs', version: '2' });
    });

    it('serves a multi-version route on both versions', async () => {
      await request(app.getHttpServer())
        .get('/v1/birds')
        .expect(200, { resource: 'birds', versions: ['1', '2'] });
      await request(app.getHttpServer())
        .get('/v2/birds')
        .expect(200, { resource: 'birds', versions: ['1', '2'] });
    });

    it('serves a VERSION_NEUTRAL route with no version prefix', async () => {
      await request(app.getHttpServer())
        .get('/status')
        .expect(200, { ok: true });
    });

    it('404s an unknown version and a missing version', async () => {
      await request(app.getHttpServer()).get('/v3/cats').expect(404);
      await request(app.getHttpServer()).get('/cats').expect(404);
    });
  });

  describe('Header Versioning', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp({
        type: VersioningType.HEADER,
        header: 'X-API-Version',
      });
    });
    afterAll(async () => app.close());

    it('selects the version from the custom header', async () => {
      await request(app.getHttpServer())
        .get('/cats')
        .set('X-API-Version', '1')
        .expect(200, { resource: 'cats', version: '1' });
      await request(app.getHttpServer())
        .get('/cats')
        .set('X-API-Version', '2')
        .expect(200, { resource: 'cats', version: '2' });
    });

    it('reaches the neutral route without a header but 404s a versioned route without one', async () => {
      await request(app.getHttpServer())
        .get('/status')
        .expect(200, { ok: true });
      await request(app.getHttpServer()).get('/cats').expect(404);
    });
  });

  describe('Media Type Versioning', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp({ type: VersioningType.MEDIA_TYPE, key: 'v=' });
    });
    afterAll(async () => app.close());

    it('selects the version from the Accept header', async () => {
      await request(app.getHttpServer())
        .get('/cats')
        .set('Accept', 'application/json;v=2')
        .expect(200, { resource: 'cats', version: '2' });
    });
  });

  describe('Custom Versioning', () => {
    let app: INestApplication;
    beforeAll(async () => {
      // Extract the version from an arbitrary request aspect (here an `x-version` header).
      const extractor = (req: unknown): string => {
        const header = (
          req as { headers: Record<string, string | string[] | undefined> }
        ).headers['x-version'];
        return Array.isArray(header) ? (header[0] ?? '') : (header ?? '');
      };
      app = await createApp({ type: VersioningType.CUSTOM, extractor });
    });
    afterAll(async () => app.close());

    it('selects the version returned by the extractor function', async () => {
      await request(app.getHttpServer())
        .get('/cats')
        .set('x-version', '1')
        .expect(200, { resource: 'cats', version: '1' });
      await request(app.getHttpServer())
        .get('/cats')
        .set('x-version', '2')
        .expect(200, { resource: 'cats', version: '2' });
    });
  });
});
