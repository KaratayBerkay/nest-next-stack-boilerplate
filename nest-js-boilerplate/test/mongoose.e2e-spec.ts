import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { MongooseDemoModule } from '../src/mongoose/mongoose-demo.module';

// #25 Mongo (Mongoose) + #108 mongodb recipe. Boots the standalone Mongoose
// module against the dev Mongo container (`docker compose --profile mongo up`)
// on a per-run database, dropped around the suite for isolation. Drives it over
// HTTP to prove the documented integration: forRoot/forFeature, @Schema/@Prop
// schema, @InjectModel model injection, and CRUD. Run with `pnpm test:orms`.
interface CatBody {
  _id: string;
  name: string;
  age: number;
  tags: string[];
}

describe('Techniques / Mongoose (#25, #108) (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MongooseDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    connection = app.get(getConnectionToken());
    await connection.dropDatabase(); // clean slate
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });

  it('creates a document (@InjectModel save) and reads it back', async () => {
    const res = await request(app.getHttpServer())
      .post('/mongoose/cats')
      .send({
        name: 'Maru',
        age: 7,
        breed: 'Scottish Fold',
        tags: ['box', 'famous'],
      })
      .expect(201);
    const created = res.body as CatBody;
    // Mongo assigned an _id; the array @Prop([String]) persisted.
    expect(typeof created._id).toBe('string');
    expect(created).toMatchObject({
      name: 'Maru',
      age: 7,
      tags: ['box', 'famous'],
    });

    const fetchedRes = await request(app.getHttpServer())
      .get(`/mongoose/cats/${created._id}`)
      .expect(200);
    expect((fetchedRes.body as CatBody).name).toBe('Maru');
  });

  it('lists (find) and deletes (findByIdAndDelete)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/mongoose/cats')
      .send({ name: 'Tom' })
      .expect(201);
    const created = createRes.body as CatBody;

    const listRes = await request(app.getHttpServer())
      .get('/mongoose/cats')
      .expect(200);
    const list = listRes.body as CatBody[];
    expect(list.some((c) => c._id === created._id)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/mongoose/cats/${created._id}`)
      .expect(200)
      .expect({ deleted: true });

    // findById now returns null → Nest sends 200 with an empty body.
    const gone = await request(app.getHttpServer())
      .get(`/mongoose/cats/${created._id}`)
      .expect(200);
    expect(gone.body).toEqual({});
  });
});
