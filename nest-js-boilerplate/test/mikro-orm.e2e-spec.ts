import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { MikroOrmDemoModule } from '../src/mikro-orm/mikro-orm-demo.module';

// #106 MikroORM (recipe). Boots the standalone MikroORM module over an in-memory
// SQLite DB and drives it over HTTP, proving the documented integration:
// forRoot/forFeature wiring, @InjectRepository(EntityRepository), the
// request-scoped EntityManager (Unit of Work / persistAndFlush), and CRUD.
// MikroORM has no synchronize, so the schema is created via the SchemaGenerator
// after boot. Run with `pnpm test:orms` (hermetic — no external DB needed).
interface BookBody {
  id: number;
  title: string;
  author: string;
}

describe('Recipes / MikroORM (#106) (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MikroOrmDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    // No synchronize in MikroORM — build the schema for the :memory: connection.
    await app.get(MikroORM).getSchemaGenerator().createSchema();
  });

  afterAll(async () => {
    await app.close();
  });

  it('persists an entity (persistAndFlush) and reads it back via the repository', async () => {
    const res = await request(app.getHttpServer())
      .post('/mikro-orm/books')
      .send({ title: 'Refactoring', author: 'Martin Fowler' })
      .expect(201);
    const created = res.body as BookBody;
    // @PrimaryKey assigned an id on flush.
    expect(typeof created.id).toBe('number');
    expect(created).toMatchObject({
      title: 'Refactoring',
      author: 'Martin Fowler',
    });

    const fetchedRes = await request(app.getHttpServer())
      .get(`/mikro-orm/books/${created.id}`)
      .expect(200);
    expect((fetchedRes.body as BookBody).title).toBe('Refactoring');
  });

  it('lists (findAll) and deletes (removeAndFlush)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/mikro-orm/books')
      .send({ title: 'Clean Code', author: 'Robert Martin' })
      .expect(201);
    const created = createRes.body as BookBody;

    const listRes = await request(app.getHttpServer())
      .get('/mikro-orm/books')
      .expect(200);
    const list = listRes.body as BookBody[];
    expect(list.some((b) => b.id === created.id)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/mikro-orm/books/${created.id}`)
      .expect(200)
      .expect({ deleted: true });

    // findOne now returns null → Nest sends 200 with an empty body.
    const gone = await request(app.getHttpServer())
      .get(`/mikro-orm/books/${created.id}`)
      .expect(200);
    expect(gone.body).toEqual({});
  });
});
