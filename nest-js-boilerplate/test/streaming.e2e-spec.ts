import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { StreamingModule } from '../src/streaming/streaming.module';

// Proves the documented StreamableFile behaviors over HTTP: Buffer + fs-stream
// bodies and header control via constructor options, @Header and @Res passthrough.
describe('Streaming files (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StreamingModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a Buffer as application/octet-stream with an auto Content-Length', async () => {
    const res = await request(app.getHttpServer())
      .get('/streaming/octet')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/application\/octet-stream/);
    expect(res.headers['content-length']).toBe(
      String(Buffer.byteLength('hello stream')),
    );
  });

  it('applies the constructor options (type, disposition, length) and body', async () => {
    const res = await request(app.getHttpServer())
      .get('/streaming/json-options')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="data.json"',
    );
    expect(res.headers['content-length']).toBe(
      String(Buffer.byteLength(JSON.stringify({ ok: true, n: 42 }))),
    );
    expect(res.body).toEqual({ ok: true, n: 42 });
  });

  it('streams a real file off disk via createReadStream', async () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { name: string };
    const res = await request(app.getHttpServer())
      .get('/streaming/file')
      .expect(200);
    expect((res.body as { name: string }).name).toBe(pkg.name);
  });

  it('@Header overrides the default content type', async () => {
    const res = await request(app.getHttpServer())
      .get('/streaming/header')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="h.json"',
    );
    expect(res.body).toEqual({ via: 'header' });
  });

  it('@Res({ passthrough: true }) sets headers directly', async () => {
    const res = await request(app.getHttpServer())
      .get('/streaming/passthrough')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="p.json"',
    );
    expect(res.body).toEqual({ via: 'passthrough' });
  });
});
