import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { SequelizeDemoModule } from '../src/sequelize/sequelize-demo.module';

// #109 Sequelize (recipe). Boots the standalone @nestjs/sequelize module over an
// in-memory SQLite DB and drives it over HTTP, proving the documented
// integration: forRoot/forFeature wiring, sequelize-typescript @Table/@Column
// models, @InjectModel model injection, and CRUD via the model's static methods.
// Run with `pnpm test:orms` (hermetic — no external DB needed).
interface CatBody {
  id: number;
  name: string;
  age: number;
  breed: string;
}

describe('Recipes / Sequelize (#109) (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SequelizeDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a row (model.create) and reads it back (findByPk)', async () => {
    const res = await request(app.getHttpServer())
      .post('/sequelize/cats')
      .send({ name: 'Maru', age: 7, breed: 'Scottish Fold' })
      .expect(201);
    const created = res.body as CatBody;
    // The auto-increment PK was assigned and the @Column attributes persisted —
    // proof the model accessors weren't shadowed (useDefineForClassFields: false).
    expect(typeof created.id).toBe('number');
    expect(created).toMatchObject({
      name: 'Maru',
      age: 7,
      breed: 'Scottish Fold',
    });

    const fetchedRes = await request(app.getHttpServer())
      .get(`/sequelize/cats/${created.id}`)
      .expect(200);
    expect((fetchedRes.body as CatBody).name).toBe('Maru');
  });

  it('lists (findAll) and deletes (destroy)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/sequelize/cats')
      .send({ name: 'Tom' })
      .expect(201);
    const created = createRes.body as CatBody;

    const listRes = await request(app.getHttpServer())
      .get('/sequelize/cats')
      .expect(200);
    const list = listRes.body as CatBody[];
    expect(list.some((c) => c.id === created.id)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/sequelize/cats/${created.id}`)
      .expect(200)
      .expect({ deleted: true });

    // findByPk now returns null → Nest sends 200 with an empty body.
    const gone = await request(app.getHttpServer())
      .get(`/sequelize/cats/${created.id}`)
      .expect(200);
    expect(gone.body).toEqual({});
  });
});
