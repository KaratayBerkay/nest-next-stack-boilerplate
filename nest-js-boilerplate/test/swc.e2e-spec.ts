import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { SwcDemoModule } from '../src/swc/swc-demo.module';

// #103 SWC. Unlike every other spec (ts-jest), this file — and the Nest module
// it boots — is transpiled by **SWC** via `@swc/jest` + the root `.swcrc` (see
// test/jest-swc.json, run with `pnpm test:swc`). The proof is behavioural, not
// "it compiled": a Nest app wired entirely *by reflected type* only works if
// SWC preserved decorator metadata (`decoratorMetadata: true` in `.swcrc`).
describe('Recipes / SWC (#103) — Nest compiled by @swc/jest', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SwcDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves constructor DI by type (design:paramtypes survived SWC)', async () => {
    const res = await request(app.getHttpServer()).get('/swc/ping').expect(200);
    // 1 + 2 + 3: the injected SwcMathService computed it, so DI-by-type wired.
    expect(res.body).toEqual({ swc: true, sum: 6 });
  });

  it('ValidationPipe infers the DTO from SWC-emitted param metadata', async () => {
    await request(app.getHttpServer())
      .post('/swc/sum')
      .send({ numbers: [10, 20, 12] })
      .expect(201)
      .expect({ total: 42 });
  });

  it('rejects an invalid body (proves the pipe knew the param was SumDto)', async () => {
    // Without param-type metadata the pipe wouldn't validate against SumDto and
    // this malformed payload would slip through as a 201.
    await request(app.getHttpServer())
      .post('/swc/sum')
      .send({ numbers: 'not-an-array' })
      .expect(400);
  });
});
