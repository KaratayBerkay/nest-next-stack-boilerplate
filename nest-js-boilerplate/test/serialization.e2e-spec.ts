import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SerializationModule } from '../src/serialization/serialization.module';

describe('Serialization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SerializationModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('@Exclude / @Expose / @Transform on a class instance', () => {
    it('strips @Exclude, adds the @Expose getter, and @Transform-collapses the nested role', async () => {
      const res = await request(app.getHttpServer())
        .get('/serialization/user')
        .expect(200);

      // password removed; fullName computed; role flattened to its name.
      expect(res.body).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'admin',
      });
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('@SerializeOptions({ excludePrefixes })', () => {
    it('drops properties whose name starts with the excluded prefix', async () => {
      const res = await request(app.getHttpServer())
        .get('/serialization/prefixed')
        .expect(200);

      expect(res.body).toEqual({ theme: 'dark' });
      expect(res.body).not.toHaveProperty('_internalId');
    });
  });

  describe('@SerializeOptions({ type }) — transform plain objects', () => {
    it('coerces a returned plain object into the entity and applies its decorators', async () => {
      const res = await request(app.getHttpServer())
        .get('/serialization/plain?id=1')
        .expect(200);

      expect(res.body).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'admin',
      });
      expect(res.body).not.toHaveProperty('password');
    });

    it('applies the same rules to the other conditional branch', async () => {
      const res = await request(app.getHttpServer())
        .get('/serialization/plain?id=2')
        .expect(200);

      expect(res.body).toEqual({
        id: 2,
        firstName: 'Kamil',
        lastName: 'Mysliwiec',
        fullName: 'Kamil Mysliwiec',
        role: 'user',
      });
      expect(res.body).not.toHaveProperty('password');
    });
  });
});
