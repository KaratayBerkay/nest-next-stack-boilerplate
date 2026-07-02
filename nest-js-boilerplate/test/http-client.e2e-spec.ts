import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { HttpClientModule } from '../src/http-client/http-client.module';

// A tiny local upstream so the HttpService calls are real but hermetic (no internet).
function startUpstream(): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/data') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 1, name: 'remote cat' }));
      return;
    }
    if (req.method === 'POST' && req.url === '/echo') {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(Buffer.concat(chunks)); // echo the request body back
      });
      return;
    }
    if (req.method === 'GET' && req.url === '/boom') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'boom' }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('HTTP module (e2e)', () => {
  let app: INestApplication;
  let upstream: Server;
  let baseUrl: string;

  beforeAll(async () => {
    ({ server: upstream, baseUrl } = await startUpstream());
    const moduleRef = await Test.createTestingModule({
      imports: [HttpClientModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve) => upstream.close(() => resolve()));
  });

  it('registerAsync options reach the axios instance', async () => {
    const res = await request(app.getHttpServer())
      .get('/http-client/config')
      .expect(200);
    expect(res.body).toEqual({ timeout: 8000, maxRedirects: 5 });
  });

  it('GET via HttpService Observable -> firstValueFrom yields the upstream body', async () => {
    const res = await request(app.getHttpServer())
      .get('/http-client/fetch')
      .query({ url: `${baseUrl}/data` })
      .expect(200);
    expect(res.body).toEqual({ id: 1, name: 'remote cat' });
  });

  it('axiosRef gives direct access to the underlying axios instance', async () => {
    const res = await request(app.getHttpServer())
      .get('/http-client/fetch-raw')
      .query({ url: `${baseUrl}/data` })
      .expect(200);
    expect(res.body).toEqual({
      status: 200,
      data: { id: 1, name: 'remote cat' },
    });
  });

  it('POST sends a body and returns the upstream response', async () => {
    const res = await request(app.getHttpServer())
      .post('/http-client/post')
      .query({ url: `${baseUrl}/echo` })
      .send({ hello: 'world' })
      .expect(201);
    expect(res.body).toEqual({ hello: 'world' });
  });

  it('catchError maps an upstream failure to a domain error (503)', async () => {
    await request(app.getHttpServer())
      .get('/http-client/fetch-or-fail')
      .query({ url: `${baseUrl}/boom` })
      .expect(503);
  });
});
