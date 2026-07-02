import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { TypeormDemoModule } from '../src/typeorm/typeorm-demo.module';

// #24 Database (TypeORM) + #107 sql-typeorm recipe. Boots the standalone
// TypeORM module over an in-memory SQLite DB and drives it over HTTP, proving
// the documented integration end-to-end: forRoot/forFeature wiring, repository
// injection (@InjectRepository), CRUD, and a @OneToMany relation persisted via
// cascade. Run with `pnpm test:orms` (hermetic — no external DB needed).
interface UserBody {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  photos: { url: string }[];
}

describe('Techniques / TypeORM (#24, #107) (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TypeormDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('persists an entity + cascaded relation and reads it back', async () => {
    const res = await request(app.getHttpServer())
      .post('/typeorm/users')
      .send({
        firstName: 'Ada',
        lastName: 'Lovelace',
        photos: ['a.jpg', 'b.jpg'],
      })
      .expect(201);
    const created = res.body as UserBody;
    // @PrimaryGeneratedColumn assigned an id; @Column({ default: true }) applied.
    expect(typeof created.id).toBe('number');
    expect(created).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      isActive: true,
    });

    const fetchedRes = await request(app.getHttpServer())
      .get(`/typeorm/users/${created.id}`)
      .expect(200);
    const fetched = fetchedRes.body as UserBody;
    // The @OneToMany relation round-tripped (loaded via { relations: { photos: true } }).
    expect(fetched.photos).toHaveLength(2);
    expect(fetched.photos.map((p) => p.url).sort()).toEqual(['a.jpg', 'b.jpg']);
  });

  it('lists (find) and deletes (delete), after which the row is gone', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/typeorm/users')
      .send({ firstName: 'Grace', lastName: 'Hopper' })
      .expect(201);
    const created = createRes.body as UserBody;

    const listRes = await request(app.getHttpServer())
      .get('/typeorm/users')
      .expect(200);
    const list = listRes.body as UserBody[];
    expect(list.some((u) => u.id === created.id)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/typeorm/users/${created.id}`)
      .expect(200)
      .expect({ deleted: true });

    // findOne now returns null → Nest sends 200 with an empty body.
    const gone = await request(app.getHttpServer())
      .get(`/typeorm/users/${created.id}`)
      .expect(200);
    expect(gone.body).toEqual({});
  });
});
