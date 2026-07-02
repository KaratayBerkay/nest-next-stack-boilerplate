import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PipesModule } from '../src/pipes/pipes.module';

describe('Pipes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PipesModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ParseIntPipe', () => {
    it('transforms a numeric param to a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/pipes/int/42')
        .expect(200);
      expect(res.body).toEqual({ id: 42, type: 'number' });
    });

    it('rejects a non-numeric param with 400', async () => {
      await request(app.getHttpServer()).get('/pipes/int/abc').expect(400);
    });

    it('honours a custom errorHttpStatusCode (406)', async () => {
      await request(app.getHttpServer()).get('/pipes/strict/abc').expect(406);
    });
  });

  describe('ParseUUIDPipe', () => {
    it('accepts a valid v4 UUID', async () => {
      const uuid = '4fa85f64-5717-4562-b3fc-2c963f66afa6';
      const res = await request(app.getHttpServer())
        .get(`/pipes/uuid/${uuid}`)
        .expect(200);
      expect(res.body).toEqual({ uuid });
    });

    it('rejects a malformed UUID with 400', async () => {
      await request(app.getHttpServer())
        .get('/pipes/uuid/not-a-uuid')
        .expect(400);
    });
  });

  describe('ParseEnumPipe', () => {
    it('accepts an enum member', async () => {
      const res = await request(app.getHttpServer())
        .get('/pipes/sort/asc')
        .expect(200);
      expect(res.body).toEqual({ sort: 'asc' });
    });

    it('rejects a value outside the enum with 400', async () => {
      await request(app.getHttpServer())
        .get('/pipes/sort/sideways')
        .expect(400);
    });
  });

  describe('ParseArrayPipe', () => {
    it('splits a CSV query and coerces items to numbers', async () => {
      const res = await request(app.getHttpServer())
        .get('/pipes/sum?ids=1,2,3')
        .expect(200);
      expect(res.body).toEqual({ ids: [1, 2, 3], total: 6 });
    });
  });

  describe('DefaultValuePipe chaining', () => {
    it('supplies typed defaults when the query is absent', async () => {
      const res = await request(app.getHttpServer())
        .get('/pipes/find')
        .expect(200);
      expect(res.body).toEqual({ activeOnly: false, page: 0 });
    });

    it('parses provided query values through the following pipe', async () => {
      const res = await request(app.getHttpServer())
        .get('/pipes/find?activeOnly=true&page=2')
        .expect(200);
      expect(res.body).toEqual({ activeOnly: true, page: 2 });
    });
  });

  describe('Custom CustomValidationPipe (class-validator)', () => {
    it('accepts a valid DTO body', async () => {
      const res = await request(app.getHttpServer())
        .post('/pipes/cats')
        .send({ name: 'Felix', age: 3 })
        .expect(201);
      expect(res.body).toEqual({ received: { name: 'Felix', age: 3 } });
    });

    it('rejects an invalid DTO body with 400', async () => {
      await request(app.getHttpServer())
        .post('/pipes/cats')
        .send({ name: 'F', age: -1 })
        .expect(400);
    });
  });
});
