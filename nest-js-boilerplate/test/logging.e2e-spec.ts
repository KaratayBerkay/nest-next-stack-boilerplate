/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  INestApplication,
  RequestMethod,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Writable } from 'node:stream';
import { Logger, LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { buildPinoHttpOptions } from '../src/logging/logging.config';
import {
  getRequestId,
  requestContextMiddleware,
} from '../src/logging/request-context';

// A tiny controller that returns whatever request id the AsyncLocalStorage holds, so we can
// assert the handler, the log line, and the response header all agree on one id.
@Controller()
class PingController {
  @Get('ping')
  ping(): { requestId: string | undefined } {
    return { requestId: getRequestId() };
  }
}

@Controller('health')
class HealthController {
  @Get()
  live(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  ready(): { status: string } {
    return { status: 'ok' };
  }
}

interface RequestLog {
  level: number;
  correlationId?: string;
  req?: { id?: string; headers?: Record<string, unknown> };
  res?: { statusCode?: number };
}

describe('Logging — Pino (e2e)', () => {
  let app: INestApplication;
  // Capture Pino's output by handing it a writable sink instead of stdout. We drive the REAL
  // option builder (genReqId/customProps/redact), in prod mode so the output is raw JSON.
  const lines: string[] = [];
  const sink = new Writable({
    write(chunk: Buffer, _enc, cb) {
      lines.push(chunk.toString());
      cb();
    },
  });

  const parsed = (): RequestLog[] =>
    lines.flatMap((l) =>
      l
        .split('\n')
        .filter(Boolean)
        .map((j) => JSON.parse(j) as RequestLog),
    );

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: [buildPinoHttpOptions({ nodeEnv: 'production' }), sink],
          exclude: [
            { method: RequestMethod.ALL, path: 'health' },
            { method: RequestMethod.ALL, path: 'health/ready' },
          ],
        }),
      ],
      controllers: [PingController, HealthController],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true });
    app.useLogger(app.get(Logger));
    app.use(requestContextMiddleware);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    lines.length = 0;
  });

  // pino-http writes the completed-request line on the response 'finish' event, which can land
  // a tick after supertest resolves. Yield once so the sink is guaranteed to have it.
  const flush = () => new Promise((r) => setImmediate(r));

  it('emits a JSON request log carrying the request id and echoes it on x-request-id', async () => {
    const res = await request(app.getHttpServer()).get('/ping').expect(200);
    await flush();

    const id = res.headers['x-request-id'];
    expect(id).toBeTruthy();
    // The handler observed the same id via AsyncLocalStorage.
    expect((res.body as { requestId: string }).requestId).toBe(id);

    const reqLog = parsed().find((l) => l.req?.id === id);
    expect(reqLog).toBeDefined();
    // customProps surfaced the id under the audit trail's field name.
    expect(reqLog?.correlationId).toBe(id);
    expect(reqLog?.res?.statusCode).toBe(200);
  });

  it('honors an inbound x-request-id (gateway correlation flows through)', async () => {
    const incoming = 'gw-correlation-abc123';
    const res = await request(app.getHttpServer())
      .get('/ping')
      .set('x-request-id', incoming)
      .expect(200);
    await flush();

    expect(res.headers['x-request-id']).toBe(incoming);
    expect((res.body as { requestId: string }).requestId).toBe(incoming);
    expect(parsed().some((l) => l.req?.id === incoming)).toBe(true);
  });

  it('redacts the Authorization header from logs', async () => {
    await request(app.getHttpServer())
      .get('/ping')
      .set('authorization', 'Bearer super-secret-token')
      .expect(200);
    await flush();

    expect(lines.join('\n')).not.toContain('super-secret-token');
    const reqLog = parsed().find((l) => l.req?.headers);
    expect(reqLog?.req?.headers).not.toHaveProperty('authorization');
  });

  it('excludes /health and /health/ready from request logs', async () => {
    // Normal path logs a request-completion line.
    await request(app.getHttpServer()).get('/ping').expect(200);
    await flush();
    const pingLogs = parsed().filter((l) => l.req?.id);
    const pingCount = pingLogs.length;

    // Excluded paths emit no new request-completion line.
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/health/ready').expect(200);
    await flush();
    const afterHealthLogs = parsed().filter((l) => l.req?.id);
    expect(afterHealthLogs.length).toBe(pingCount);
  });
});
