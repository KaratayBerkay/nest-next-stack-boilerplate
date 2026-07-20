/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ExceptionFiltersModule } from '../src/exception-filters/exception-filters.module';

// Proves checklist #6 (Exception filters): Nest's built-in HttpException handling and the documented
// custom @Catch(HttpException) / catch-everything @Catch() filters, bound at route scope via
// @UseFilters. Self-contained — only the feature module is booted, no Postgres/Redis needed.
interface ErrorBody {
  statusCode: number;
  timestamp?: string;
  path?: string;
  message?: string;
  error?: string;
}

describe('Exception filters (e2e)', () => {
  let app: INestApplication;

  const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ExceptionFiltersModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('renders a built-in exception with Nest default shape when no filter is bound', async () => {
    const res = await request(app.getHttpServer())
      .get('/errors/builtin')
      .expect(403);
    expect(res.body).toEqual({
      statusCode: 403,
      message: 'no entry',
      error: 'Forbidden',
    });
  });

  it('@Catch(HttpException) filter rewrites the body to the documented envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/errors/custom')
      .expect(403);
    const body = res.body as ErrorBody;
    expect(body).toMatchObject({
      statusCode: 403,
      path: '/errors/custom',
      message: 'no entry',
    });
    expect(body.timestamp).toMatch(ISO);
    // The custom envelope replaces the default — Nest's `error` field is gone, proving our filter ran.
    expect(body.error).toBeUndefined();
  });

  it('handles a custom HttpException subclass, preserving its status (418)', async () => {
    const res = await request(app.getHttpServer())
      .get('/errors/teapot')
      .expect(418);
    const body = res.body as ErrorBody;
    expect(body).toMatchObject({
      statusCode: 418,
      path: '/errors/teapot',
      message: "I'm a teapot",
    });
    expect(body.timestamp).toMatch(ISO);
  });

  it('catch-everything filter maps a non-HTTP error to 500 via the HttpAdapter', async () => {
    const res = await request(app.getHttpServer())
      .get('/errors/unknown')
      .expect(500);
    const body = res.body as ErrorBody;
    expect(body).toMatchObject({
      statusCode: 500,
      path: '/errors/unknown',
    });
    expect(body.timestamp).toMatch(ISO);
    // The catch-everything envelope follows the docs shape — no `message` leaked from the raw error.
    expect(body.message).toBeUndefined();
  });
});
