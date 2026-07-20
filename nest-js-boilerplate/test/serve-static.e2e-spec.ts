/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { StaticAssetsModule } from '../src/serve-static/serve-static.module';

// Proves the Serve Static recipe (#116) over HTTP. StaticAssetsModule wraps
// ServeStaticModule.forRoot({ rootPath, serveRoot: '/static', exclude, serveStaticOptions }) and
// serves files from src/serve-static/public. The tests exercise each documented option: a file is
// served (rootPath) under its prefix (serveRoot) with the index served at the prefix root and a
// custom header applied (serveStaticOptions.setHeaders), the SPA catch-all (renderPath default
// '{*any}') returns index.html for unknown paths, and an excluded sub-path stays unreachable.
//
// NOTE: this boots with NestFactory.create (the real app flow), NOT Test.createTestingModule().
// ServeStaticModule selects its loader in a DI factory that reads HttpAdapterHost.httpAdapter at
// *instantiation* time. TestingModule.compile() instantiates providers before createNestApplication()
// attaches the adapter, so the factory sees no adapter and falls back to NoopLoader — nothing gets
// served and every route 404s. NestFactory sets the adapter before instantiating providers, exactly
// as production does, so the ExpressLoader is selected. Logged in the checklist's Docs issues log.
describe('Serve Static / assets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(StaticAssetsModule, { logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves index.html at the serveRoot prefix (rootPath + serveRoot + index)', async () => {
    const res = await request(app.getHttpServer()).get('/static/').expect(200);
    expect(res.text).toContain('Hello from @nestjs/serve-static');
    // serveStaticOptions.setHeaders reached the underlying serve-static.
    expect(res.headers['x-served-by']).toBe('serve-static-module');
  });

  it('serves a static asset with the right content-type', async () => {
    const res = await request(app.getHttpServer())
      .get('/static/app.css')
      .expect(200);
    expect(res.headers['content-type']).toContain('text/css');
    expect(res.text).toContain('rebeccapurple');
  });

  it('renderPath fallback: unknown paths under the prefix return index.html (SPA support)', async () => {
    const res = await request(app.getHttpServer())
      .get('/static/does/not/exist')
      .expect(200);
    expect(res.text).toContain('Hello from @nestjs/serve-static');
  });

  it('exclude: an excluded prefix gets no index.html fallback, so unknown paths 404', async () => {
    // /static/does/not/exist (above) returns index.html via the render fallback; the same kind of
    // unknown path under the excluded /static/api/* prefix instead 404s — that is what exclude does.
    await request(app.getHttpServer()).get('/static/api/users').expect(404);
  });

  it('serveRoot namespacing: paths outside the prefix are not served', async () => {
    await request(app.getHttpServer()).get('/').expect(404);
  });
});
